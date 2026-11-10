<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\General_setting;
use App\Models\InstructorEarning;
use App\Models\InstructorEarningAllocation;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class PayoutController extends Controller
{
    public function index(Request $request)
{
    $user = $request->user();

    $period = $request->validate([
        'period' => ['sometimes', 'in:7d,30d,3m,6m,12m,all'],
    ])['period'] ?? '7d';

    [$currentStart, $currentEnd, $previousStart, $previousEnd] =
        $this->getPeriodDates($period, $user);

    // -------------------------
    // Revenue
    // -------------------------

    $currentEarnings = $user->instructorEarnings();
    $previousEarnings = $user->instructorEarnings();

    if ($period !== 'all') {
        $currentEarnings->whereBetween('created_at', [$currentStart, $currentEnd]);
        $previousEarnings->whereBetween('created_at', [$previousStart, $previousEnd]);
    }

    $currentRevenue = $currentEarnings->sum('net_amount');
    $previousRevenue = $previousEarnings->sum('net_amount');

    // -------------------------
    // Sales
    // -------------------------

    $currentSales = $period === 'all'
        ? $user->instructorEarnings()->count()
        : $user->instructorEarnings()
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

    $previousSales = $period === 'all'
        ? $user->instructorEarnings()->count()
        : $user->instructorEarnings()
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

    // -------------------------
    // Students
    // -------------------------

    $currentStudents = $this->studentsCount(
        $user,
        $period === 'all' ? null : $currentStart,
        $period === 'all' ? null : $currentEnd
    );

    $previousStudents = $period === 'all'
        ? $currentStudents
        : $this->studentsCount($user, $previousStart, $previousEnd);

    // -------------------------
    // Courses
    // -------------------------

    $totalCourses = $user->courses()->count();

    // -------------------------
    // Pending earnings
    // -------------------------

    $pendingEarnings = $user->payoutRequests()
        ->whereIn('status', ['pending', 'approved'])
        ->sum('amount');

    // -------------------------
    // Available balance
    // -------------------------

    $paidEarnings = $user->payoutRequests()->where('status' , "paid")->sum('amount');

    // -------------------------
    // Available balance
    // -------------------------

    // $availableBalance = $this->availableSum($user);
    $availableBalance = $currentRevenue - $pendingEarnings - $paidEarnings ;

    return response()->json([
        'currency' => 'USD',

        'total_revenue' => [
            'value' => round($currentRevenue, 2),
            'change' => $this->percentageChange(
                $previousRevenue,
                $currentRevenue
            ),
        ],

        'total_sales' => [
            'value' => $currentSales,
            'change' => $this->percentageChange(
                $previousSales,
                $currentSales
            ),
        ],

        'total_students' => [
            'value' => $currentStudents,
            'change' => $this->percentageChange(
                $previousStudents,
                $currentStudents
            ),
        ],

        'total_courses' => [
            'value' => $totalCourses,
        ],

        'pending_earnings' => [
            'value' => round($pendingEarnings, 2),
        ],

        'available_balance' => [
            'value' => round($availableBalance, 2) <= 0 ? 0 : round($availableBalance, 2),
        ],

        'paid_earnings' => [
            'value' => round($paidEarnings, 2),
        ],
    ]);
}

    public function requests(Request $request)
    {
        $user = $request->user();

        $pending_balance = $user->payoutRequests()
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        $paidEarnings = $user->payoutRequests()->where('status' , "paid")->sum('amount');

        $available_balance = ($user->instructorEarnings()->sum('net_amount')) - $pending_balance - $paidEarnings;

        $minimum_payout_amount = (float) (General_setting::first()?->minimum_payout_amount ?? 50);

        $payoutRequests = $user->payoutRequests()->latest()->paginate(15);
        return response()->json([
            'data' => $payoutRequests->getCollection()->map(function ($request) {
                return [
                    'id' => $request->id,
                    'amount' => (float) $request->amount,
                    'currency' => $request->currency,
                    'status' => $request->status,
                    'admin_note' => $request->rejection_reason,
                    'method' => $request->payment_details,
                    'processed_at' => $request->reviewed_at,
                    'created_at' => $request->created_at,
                ];
            })->values(),
            'balance' => [
                'available_balance' => $available_balance >= 0 ? round($available_balance, 2) : 0,
                'pending_balance' => round($pending_balance, 2),
                'minimum_payout_amount' => $minimum_payout_amount,
                // Admin-configured withdrawal methods (general_settings).
                'payment_methods' => General_setting::first()?->payoutMethods() ?? [],
            ],
            'meta' => [
                'current_page' => $payoutRequests->currentPage(),
                'last_page' => $payoutRequests->lastPage(),
                'per_page' => $payoutRequests->perPage(),
                'total' => $payoutRequests->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required' ,'string' , 'max:100'],
            'account' => ['required' ,'string' , 'max:100']
        ]);

        $user = $request->user();

        $payment_details = json_encode([
            'method' => $data['method'],
            'account' => $data['account']
        ]);

        $payout = DB::transaction(function () use ($user, $data , $payment_details) {
            $amount = round((float) $data['amount'], 2);
            $minimum = (float) (General_setting::first()?->minimum_payout_amount ?? 50);
            if ($amount < $minimum) {
                throw ValidationException::withMessages(['amount' => 'Requested amount is below the minimum payout amount.']);
            }

            $earnings = $user->instructorEarnings()
                ->where('status', 'available')
                ->withSum(['allocations as active_allocated_amount' => function ($query) {
                    $query->whereHas('payoutRequest', fn ($payout) => $payout->whereIn('status', ['pending', 'approved']));
                }], 'amount')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $available = $earnings->sum(fn ($earning) => max(0, (float) $earning->net_amount - (float) ($earning->active_allocated_amount ?? 0)));
            if ($amount > round($available, 2)) {
                throw ValidationException::withMessages(['amount' => 'Requested amount exceeds available earnings.']);
            }

            $requestRecord = PayoutRequest::create([
                'instructor_id' => $user->id,
                'amount' => number_format($amount, 2, '.', ''),
                'currency' => strtolower((string) (General_setting::first()?->currency ?? 'usd')),
                'status' => 'pending',
                'payment_details' => $payment_details,
            ]);

            $remaining = $amount;
            foreach ($earnings as $earning) {
                if ($remaining <= 0) break;
                $allocated = (float) ($earning->active_allocated_amount ?? 0);
                $unallocated = max(0, round((float) $earning->net_amount - $allocated, 2));
                $allocationAmount = min($unallocated, $remaining);
                if ($allocationAmount <= 0) continue;

                InstructorEarningAllocation::create([
                    'instructor_earning_id' => $earning->id,
                    'payout_request_id' => $requestRecord->id,
                    'amount' => number_format($allocationAmount, 2, '.', ''),
                ]);
                $remaining = round($remaining - $allocationAmount, 2);
            }

            if ($remaining > 0) {
                throw ValidationException::withMessages(['amount' => 'Requested amount exceeds available earnings.']);
            }

            return $requestRecord;
        });

        return response()->json($payout, 201);
    }

    public function revenueChart(Request $request)
    {
        $user = $request->user();
        $period = $request->validate([
            'period' => ['sometimes', 'in:7d,30d,3m,6m,12m,all'],
        ])['period'] ?? '7d';
        
        $now = now();

        $config = match ($period) {
            '7d' => [
                'start' => $now->copy()->subDays(6)->startOfDay(),
                'end' => $now->copy()->endOfDay(),
                'group' => 'day',
            ],

            '30d' => [
                'start' => $now->copy()->subDays(29)->startOfDay(),
                'end' => $now->copy()->endOfDay(),
                'group' => 'day',
            ],

            '3m' => [
                'start' => $now->copy()->subMonths(2)->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
                'group' => 'month',
            ],

            '6m' => [
                'start' => $now->copy()->subMonths(5)->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
                'group' => 'month',
            ],

            '12m' => [
                'start' => $now->copy()->subMonths(11)->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
                'group' => 'month',
            ],

            'all' => [
                'start' => $user->created_at->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
                'group' => 'month',
            ],
            

            default => throw new InvalidArgumentException(
                "Invalid period: {$period}"
            ),
        };

        $start = $config['start'];
        $end = $config['end'];

        $query = $user->instructorEarnings()
            ->whereBetween('created_at', [$start, $end]);

        if ($config['group'] === 'day') {
            $rows = $query
                ->selectRaw('DATE(created_at) as period, SUM(net_amount) as amount')
                ->groupByRaw('DATE(created_at)')
                ->orderBy('period')
                ->get()
                ->keyBy('period');

            $result = [];

            for ($date = $start->copy(); $date <= $end; $date->addDay()) {
                $key = $date->format('Y-m-d');

                $result[] = [
                    'date' => $date->copy()->startOfDay()->toISOString(),
                    'amount' => round(
                        (float) ($rows[$key]->amount ?? 0),
                        2
                    ),
                ];
            }

            return response()->json($result);
        }

        $rows = $query
            ->selectRaw(
                "DATE_FORMAT(created_at, '%Y-%m-01') as period,
                SUM(net_amount) as amount"
            )
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m-01')")
            ->orderBy('period')
            ->get()
            ->keyBy('period');

        $result = [];

        for (
            $date = $start->copy()->startOfMonth();
            $date <= $end;
            $date->addMonth()
        ) {
            $key = $date->format('Y-m-01');

            $result[] = [
                'date' => $date->copy()->startOfMonth()->toISOString(),
                'amount' => round(
                    (float) ($rows[$key]->amount ?? 0),
                    2
                ),
            ];
        }

        return response()->json($result);
    }

    public function salesChart(Request $request)
    {
        $user = $request->user();

        $period = $request->validate([
            'period' => ['sometimes', 'in:7d,30d,3m,6m,12m,all'],
        ])['period'] ?? '7d';

        [$currentStart, $currentEnd] = $this->getPeriodDates($period , $user);

        $isMonthly = in_array($period, ['3m', '6m', '12m' , 'all']);

        if ($isMonthly) {
            $salesData = $user->instructorEarnings()
                ->whereBetween('created_at', [$currentStart, $currentEnd])
                ->selectRaw(
                    "DATE_FORMAT(created_at, '%Y-%m-01') as period,
                    COUNT(*) as sales"
                )
                ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m-01')")
                ->orderBy('period')
                ->get()
                ->keyBy('period');

            $result = [];

            for (
                $date = $currentStart->copy()->startOfMonth();
                $date <= $currentEnd;
                $date->addMonth()
            ) {
                $key = $date->format('Y-m-01');

                $result[] = [
                    'date' => $date->copy()->startOfMonth()->toISOString(),
                    'count' => (int) ($salesData[$key]->sales ?? 0),
                ];
            }

            return response()->json($result);
        }

        // 7d / 30d → daily
        $salesData = $user->instructorEarnings()
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw('DATE(created_at) as period, COUNT(*) as sales')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('period')
            ->get()
            ->keyBy('period');

        $result = [];

        for (
            $date = $currentStart->copy()->startOfDay();
            $date <= $currentEnd;
            $date->addDay()
        ) {
            $key = $date->format('Y-m-d');

            $result[] = [
                'date' => $date->copy()->startOfDay()->toISOString(),
                'count' => (int) ($salesData[$key]->sales ?? 0),
            ];
        }

        return response()->json($result);
    }

    public function enrollmentChart(Request $request)
    {
        $user = $request->user();

        $period = $request->validate([
            'period' => ['sometimes', 'in:7d,30d,3m,6m,12m,all'],
        ])['period'] ?? '7d';

        [$currentStart, $currentEnd] = $this->getPeriodDates($period , $user);

        $isMonthly = in_array($period, ['3m', '6m', '12m', 'all']);

        // Enrollmentهای مربوط به دوره‌های این مدرس
        $enrollments = Enrollment::query()
            ->whereIn(
                'course_id',
                $user->courses()->select('id')
            )
            ->whereBetween('created_at', [$currentStart, $currentEnd]);

        if ($isMonthly) {
            $enrollmentData = $enrollments
                ->selectRaw(
                    "DATE_FORMAT(created_at, '%Y-%m-01') as period,
                    COUNT(*) as new_enrollments"
                )
                ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m-01')")
                ->orderBy('period')
                ->get()
                ->keyBy('period');

            // تعداد enrollmentهای قبل از شروع period
            $totalBefore = Enrollment::query()
                ->whereIn(
                    'course_id',
                    $user->courses()->select('id')
                )
                ->where('created_at', '<', $currentStart)
                ->count();

            $result = [];
            $totalEnrollments = $totalBefore;

            for (
                $date = $currentStart->copy()->startOfMonth();
                $date <= $currentEnd;
                $date->addMonth()
            ) {
                $key = $date->format('Y-m-01');

                $newEnrollments = (int) (
                    $enrollmentData[$key]->new_enrollments ?? 0
                );

                $totalEnrollments += $newEnrollments;

                $result[] = [
                    'date' => $date->copy()->startOfMonth()->toISOString(),
                    'new_enrollments' => $newEnrollments,
                    'total_enrollments' => $totalEnrollments,
                ];
            }

            return response()->json($result);
        }

        // 7d / 30d → روزانه
        $enrollmentData = $enrollments
            ->selectRaw(
                'DATE(created_at) as period, COUNT(*) as new_enrollments'
            )
            ->groupByRaw('DATE(created_at)')
            ->orderBy('period')
            ->get()
            ->keyBy('period');

        // تعداد enrollmentهای قبل از شروع بازه
        $totalBefore = Enrollment::query()
            ->whereIn(
                'course_id',
                $user->courses()->select('id')
            )
            ->where('created_at', '<', $currentStart)
            ->count();

        $result = [];
        $totalEnrollments = $totalBefore;

        for (
            $date = $currentStart->copy()->startOfDay();
            $date <= $currentEnd;
            $date->addDay()
        ) {
            $key = $date->format('Y-m-d');

            $newEnrollments = (int) (
                $enrollmentData[$key]->new_enrollments ?? 0
            );

            $totalEnrollments += $newEnrollments;

            $result[] = [
                'date' => $date->copy()->startOfDay()->toISOString(),
                'new_enrollments' => $newEnrollments,
                'total_enrollments' => $totalEnrollments,
            ];
        }

        return response()->json($result);
    }

    public function topPerformingCourses(Request $request): array
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 5);

        $courses = Course::query()
            ->where('courses.instructor_id', $user->id)
            ->leftJoin('order_items', 'order_items.course_id', '=', 'courses.id')
            ->leftJoin('instructor_earnings', function ($join) use ($user) {
                $join->on(
                    'instructor_earnings.order_item_id',
                    '=',
                    'order_items.id'
                )->where(
                    'instructor_earnings.instructor_id',
                    '=',
                    $user->id
                );
            })
            ->select([
                'courses.id',
                'courses.title',
                'courses.thumbnail',
            ])
            ->selectRaw('COUNT(DISTINCT instructor_earnings.id) as sales')
            ->selectRaw('COALESCE(SUM(instructor_earnings.net_amount), 0) as revenue')
            ->withCount([
                'enrollments as students',
            ])
            ->withAvg('reviews', 'rating')
            ->groupBy([
                'courses.id',
                'courses.title',
                'courses.thumbnail',
            ])
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        return $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'thumbnail' => $course->thumbnail ? url('storage/' . $course->thumbnail) : null,
                'sales' => (int) $course->sales,
                'revenue' => round((float) $course->revenue, 2),
                'students' => (int) $course->students,
                'rating' => round((float) ($course->reviews_avg_rating ?? 0), 1),
                'currency' => 'USD',
            ];
        })->values()->toArray();
    }

    public function recentSeles(Request $request)
    {
        $user = $request->user();

        $limit = (int) $request->query('limit', 10);

        $recentSales = $user->instructorEarnings()
            ->with(['order.user' , 'orderItem.course' , 'payment'])
            ->latest()
            ->limit($limit)
            ->get();
        $recentusers = $recentSales->map(function ($earning) {
            return [
                'id' => $earning->id,
                'student' => [
                    'id' => $earning->order->user->id,
                    'name' => $earning->order->user->name,
                    'avatar' => $earning->order->user->avatar ? url('storage/' . $earning->order->user->avatar) : null,
                ],
                'course' => [
                    'id' => $earning->orderItem->course->id,
                    'title' => $earning->orderItem->course->title,
                ],
                'gross_amount' => (float) $earning->gross_amount,
                'instructor_earnings' => (float) $earning->net_amount,
                'status' => $earning->payment->status,
                'created_at' => $earning->created_at,
            ];
        });
        

        return response()->json($recentusers);
    }

    public function instructorSeles(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:pending,failed,paid,canceled,all'],
            'courseId' => ['nullable'],
            'period' => ['nullable', 'string', 'in:7d,30d,3m,6m,12m,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) $request->query('per_page' , 10);

        $query = $user->instructorEarnings()
            ->with(['order.user' , 'orderItem.course' , 'payment']);

        if(!empty($data['search'])){
            $search = $data['search'];
            $query->where(function ($q) use ($search){
                $q->whereHas('orderItem.course' , fn ($qu) => $qu->where('title' , 'like' , "%{$search}%"))
                ->orWhereHas('order.user' , fn ($qu) => $qu->where('name' , 'like' , "%{$search}%"))
                ->orWhereHas('order' , fn ($qu) => $qu->where('order_number' , 'like' , "%{$search}%"));
            });
        }

        if(!empty($data['status'] && $data['status'] !== 'all')){
            $status = $data['status'];
            $query->where(function ($q) use($status){
                $q->whereHas('payment' , fn($qu) => $qu->where('status' , $status));
            });
        }

        if(!empty($data['courseId']) && $data['courseId'] !== 'all'){
            $courseId = $data['courseId'];
            $query->whereHas('orderItem.course' , fn ($qu) => $qu->where('id' , $courseId));
        }

        if(!empty($data['period']) && $data['period'] !== 'all'){
            [$currentStart, $currentEnd] = $this->getPeriodDates($data['period']);
            $query->whereBetween('created_at', [$currentStart, $currentEnd]);
        }

        $sales = $query->paginate($perPage);
        
        $data = $sales->getCollection()->map(function ($earning) {
        $user = $earning->order?->user;
        $course = $earning->orderItem?->course;
        $payment = $earning->payment;

        return [
            'id' => $earning->id,

            'student' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user->email,
                'avatar' => $user?->avatar
                    ? url('storage/' . $user->avatar)
                    : null,
            ],

            'course' => [
                'id' => $course?->id,
                'title' => $course?->title,
            ],

            'catalog_price' => $earning->orderItem?->catalog_price,

            'gross_amount' => (float) $earning->orderItem?->subtotal_before_coupon,

            'coupon_discount' => $earning->orderItem?->allocated_coupon_discount,

            'final_amount' => $earning->orderItem?->final_amount,

            'instructor_earnings' => (float) $earning->net_amount,

            'status' => $payment?->status,

            'platform_fee' => (float) $earning->commission_amount,

            'currency' => $earning->currency ?? 'USD',

            'order_id' => $earning->order->order_number,

            'created_at' => $earning->created_at,
        ];
        })->values();

        return response()->json([
            'data' => $data,

            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    public function courseOptions(Request $request)
    {
        $user = $request->user();
        $courses = $user->courses()->select('id' , 'title')->get();
        return response()->json($courses);
    }

    private function percentageChange(float|int $previous, float|int $current): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function getPeriodDates(string $period, $user = null): array
    {
        $now = now();

        return match ($period) {
            '7d' => [
                $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(13)->startOfDay(),
                $now->copy()->subDays(7)->endOfDay(),
            ],
            '30d' => [
                $now->copy()->subDays(29)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(59)->startOfDay(),
                $now->copy()->subDays(30)->endOfDay(),
            ],
            '3m' => [
                $now->copy()->subMonths(2)->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonths(5)->startOfMonth(),
                $now->copy()->subMonths(3)->endOfMonth(),
            ],
            '6m' => [
                $now->copy()->subMonths(5)->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->copy()->subMonths(6)->endOfMonth(),
            ],
            '12m' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
                $now->copy()->subYear()->startOfYear(),
                $now->copy()->subYear()->endOfYear(),
            ],
            'week' => [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
                $now->copy()->subWeek()->startOfWeek(),
                $now->copy()->subWeek()->endOfWeek(),
            ],

            'month' => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonth()->startOfMonth(),
                $now->copy()->subMonth()->endOfMonth(),
            ],

            '3months' => [
                $now->copy()->subMonths(2)->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonths(5)->startOfMonth(),
                $now->copy()->subMonths(3)->endOfMonth(),
            ],

            '6months' => [
                $now->copy()->subMonths(5)->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->copy()->subMonths(6)->endOfMonth(),
            ],

            'year' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
                $now->copy()->subYear()->startOfYear(),
                $now->copy()->subYear()->endOfYear(),
            ],

            'all' => [
                $user?->created_at?->copy()->startOfMonth() ?? $now->copy()->startOfMonth(),
                $now->copy()->endOfDay(),
                $user?->created_at?->copy()->startOfMonth() ?? $now->copy()->startOfMonth(),
                $now->copy()->endOfDay(),
            ],
            

        };
    }

    private function studentsCount($user, $start, $end): int
    {
        return $user->students()
            ->whereHas('enrollments', function ($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            })
            ->count();
    }
}
