<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\InstructorEarning;
use App\Services\CourseApprovalService;
use App\Support\MediaDiskResolver;
use App\UploadFileTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    use UploadFileTrait;

    public function index(Request $request)
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published,ongoing,completed,all'],
            'sort' => ['nullable', 'in:newest,most_revenue,most_students'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $user = $request->user();

        $query = Course::where('instructor_id', $user->id)
            ->withCount(['enrollments', 'sections'])
            ->selectSub(
                InstructorEarning::query()
                    ->selectRaw('COALESCE(SUM(instructor_earnings.net_amount), 0)')
                    ->join('order_items', 'order_items.id', '=', 'instructor_earnings.order_item_id')
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->where('instructor_earnings.instructor_id', $user->id)
                    ->where('instructor_earnings.status', '!=', 'reversed')
                    ->whereHas('payment', fn ($payment) => $payment->where('status', 'paid')),
                'total_revenue'
            )
            ->selectSub(
                InstructorEarning::query()
                    ->selectRaw('COUNT(*)')
                    ->join('order_items', 'order_items.id', '=', 'instructor_earnings.order_item_id')
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->where('instructor_earnings.instructor_id', $user->id)
                    ->where('instructor_earnings.status', '!=', 'reversed')
                    ->whereHas('payment', fn ($payment) => $payment->where('status', 'paid')),
                'sales_count'
            )
            ->with('category:id,name,slug');

        if (!empty($data['search'])) {
            $search = $data['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($data['category']) && $data['category'] !== 'all') {
            $query->whereHas('category', fn ($q) => $q->where('slug', $data['category']));
        }

        if (!empty($data['status']) && $data['status'] !== 'all') {
            if ($data['status'] === 'published') {
                $query->where('is_active', true);
            } elseif ($data['status'] === 'draft') {
                $query->where('is_active', false);
            } else {
                $query->where('status', $data['status']);
            }
        }

        match ($data['sort'] ?? 'newest') {
            'most_revenue' => $query->orderByDesc('total_revenue'),
            'most_students' => $query->orderByDesc('enrollments_count'),
            default => $query->orderByDesc('created_at'),
        };

        $courses = $query->paginate($data['per_page'] ?? 10);

        return response()->json([
            'data' => $courses->getCollection()->map(fn (Course $course) => $this->presentCourse($course))->values(),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request, true);

        $course = new Course($this->courseAttributes($request, $data));
        $course->instructor_id = $request->user()->id;
        $course->slug = Str::slug($data['title']) . '-c' . Str::random(6);
        // 'status' (ongoing/completed) comes from the form via
        // courseAttributes(); whether the course is a private draft or waiting
        // for admin approval lives in approval_status — see resolveApprovalStatus().
        $course->is_active = false;
        [$approvalStatus, $submittedAt] = $this->resolveApprovalStatus($request);
        $course->approval_status = $approvalStatus;
        $course->submitted_for_approval_at = $submittedAt;
        $course->save();

        return response()->json($this->presentCourse(
            $course->fresh()->load('category:id,name,slug')
        ), 201);
    }

    public function show(Request $request, Course $course)
    {
        $this->authorizeOwner($request, $course);

        $course->load(['category:id,name,slug', 'sections' => fn ($query) => $query->orderBy('sort_order'), 'sections.lessons' => fn ($query) => $query->orderBy('sort_order')])
            ->loadCount(['enrollments', 'sections']);

        $payload = $this->presentCourse($course);
        $payload['quiz'] = $this->presentQuiz($course);

        return response()->json($payload);
    }

    /**
     * Full quiz payload (with answer keys) for the instructor editor.
     */
    protected function presentQuiz(Course $course): ?array
    {
        $quiz = \App\Models\Quiz::query()
            ->where('course_id', $course->id)
            ->with(['questions' => fn ($q) => $q->orderBy('sort_order'), 'questions.options' => fn ($q) => $q->orderBy('sort_order')])
            ->first();

        if (!$quiz) {
            return null;
        }

        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'pass_mark' => (float) $quiz->pass_mark,
            'max_attempts' => $quiz->max_attempts,
            'is_active' => (bool) $quiz->is_active,
            'questions' => $quiz->questions->map(fn ($question) => [
                'id' => $question->id,
                'question' => $question->question,
                'explanation' => $question->explanation,
                'points' => max(1, (int) $question->points),
                'options' => $question->options->map(fn ($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'is_correct' => (bool) $option->is_correct,
                ])->values(),
            ])->values(),
        ];
    }

    public function update(Request $request, Course $course)
    {

        $this->authorizeOwner($request, $course);
        $data = $this->validatedData($request, false);
        $intent = $this->resolveIntent($request);

        $attributes = $this->courseAttributes(
            $request,
            $data,
            $course,
            // Live courses keep their current media until the admin applies
            // the queued change, so uploads are deferred (old file is kept).
            deferSensitiveMedia: $course->approval_status === Course::APPROVAL_APPROVED
                || ($course->approval_status === Course::APPROVAL_PENDING && $course->approved_at !== null)
        );

        $approvalService = app(CourseApprovalService::class);

        // Any course that has ever been approved (i.e. is live) must route
        // sensitive edits through the review queue — including while it is
        // already waiting in pending_approval. Courses never approved yet
        // (draft/rejected/pending first submission) receive the full edit.
        $routesThroughQueue = $course->approval_status === Course::APPROVAL_APPROVED
            || ($course->approval_status === Course::APPROVAL_PENDING && $course->approved_at !== null);

        if ($routesThroughQueue) {
            // Only fields actually sent in this request participate in the
            // diff (media comes from the computed attributes because uploads
            // and removals are handled there, not in validation).
            $proposed = [];

            foreach (Course::SENSITIVE_FIELDS as $field) {
                if (in_array($field, ['thumbnail', 'preview_video'], true)) {
                    if (array_key_exists($field, $attributes)) {
                        $proposed[$field] = $attributes[$field];
                    }
                    continue;
                }

                if (array_key_exists($field, $data)) {
                    $proposed[$field] = $attributes[$field] ?? $data[$field];
                }
            }

            $changes = $approvalService->diffSensitiveChanges($course, $proposed);

            // Fields the instructor sent but which match the live value were
            // implicitly reverted — drop them from the review queue.
            $reverted = array_diff(array_keys($proposed), array_keys($changes));

            foreach (array_keys($proposed) as $field) {
                unset($attributes[$field]);
            }

            // The course itself stays approved and sellable; only a separate
            // edit request enters the admin review queue.
            $course->update($attributes);

            if ($changes !== [] || $reverted !== []) {
                $approvalService->submitEditRequest($course, $changes, $reverted);
            }
        } else {
            // Drafts are the instructor's private workspace. A plain save
            // keeps the current approval state (draft stays private, pending
            // stays in the queue, rejected stays rejected) — only the
            // explicit submit moves a course into the admin review queue.
            $course->update($attributes);

            if ($intent === 'submit') {
                $course->forceFill([
                    'approval_status' => Course::APPROVAL_PENDING,
                    'rejection_reason' => null,
                    'submitted_for_approval_at' => now(),
                ])->save();
            }
        }

        $fresh = $course->fresh()->load([
            'category:id,name,slug',
            'sections' => fn ($query) => $query->orderBy('sort_order'),
            'sections.lessons' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        $payload = $this->presentCourse($fresh);
        $payload['pending_approval'] = !empty($payload['pending_changes']);
        $payload['approval_message'] = $payload['pending_approval']
            ? 'Sensitive changes were submitted for admin review. The course keeps running with its current data until then.'
            : null;

        return response()->json($payload);
    }

    public function destroy(Request $request, Course $course)
    {
        $this->authorizeOwner($request, $course);

        if ($course->enrollments()->exists()) {
            return response()->json([
                'message' => 'This course has enrolled students and cannot be deleted.',
            ], 422);
        }

        foreach ($course->sections()->with('lessons')->get() as $section) {
            foreach ($section->lessons as $lesson) {
                if ($lesson->video_url) {
                    Storage::disk(MediaDiskResolver::resolve($lesson, 'video_url'))->delete($lesson->video_url);
                }

                $lesson->attachments()->get()->each->delete();
            }
        }

        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }
        if ($course->preview_video) {
            Storage::disk(MediaDiskResolver::resolve($course, 'preview_video'))->delete($course->preview_video);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }

    /**
     * The save intent comes from the dashboard: 'draft' keeps the course as
     * the instructor's private draft, 'submit' places it in the review queue.
     */
    protected function resolveIntent(Request $request): string
    {
        return $request->input('intent') === 'submit' ? 'submit' : 'draft';
    }

    /**
     * Map the save intent to an approval state for a course that has never
     * been approved. Already-approved (live) courses never pass through here.
     */
    protected function resolveApprovalStatus(Request $request): array
    {
        return $this->resolveIntent($request) === 'submit'
            ? [Course::APPROVAL_PENDING, now()]
            // A draft is the instructor's private workspace — no queue entry.
            : [Course::APPROVAL_DRAFT, null];
    }

    protected function validatedData(Request $request, bool $creating): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:160'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'category_id' => ['required', 'exists:categories,id'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'language' => ['nullable', 'string', 'max:50'],
            'currency' => ['nullable', 'string', 'size:3'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:255'],
            'objectives' => ['nullable', 'array'],
            'objectives.*' => ['string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
            'preview_video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:512000'],
            'remove_preview_video' => ['nullable', 'boolean'],
            'remove_thumbnail' => ['nullable', 'boolean'],
            'intent' => ['nullable', 'in:draft,submit'],
            // Public lifecycle of the course (ongoing = currently running,
            // completed = finished). This is a SEPARATE concern from the
            // approval workflow (draft/pending_approval/approved/rejected) and
            // must only ever hold those two values — the column is a DB enum.
            'status' => ['nullable', 'string', 'in:ongoing,completed'],
        ]);
    }

    protected function courseAttributes(Request $request, array $data, ?Course $course = null, bool $deferSensitiveMedia = false): array
    {
        $attributes = [
            'title' => $data['title'],
            'short_description' => $data['short_description'] ?? null,
            'description' => $data['description'],
            'price' => $data['price'],
            'discount_price' => $data['discount_price'] ?? null,
            'category_id' => $data['category_id'],
            'level' => $data['level'],
            'language' => $data['language'] ?? null,
            'currency' => strtoupper($data['currency'] ?? 'USD'),
            'requirements' => array_values($data['requirements'] ?? []),
            'objectives' => array_values($data['objectives'] ?? []),
            'tags' => array_values($data['tags'] ?? []),
            // The instructor's own lifecycle choice; 'ongoing' covers old
            // clients that do not send the field yet.
            'status' => in_array($data['status'] ?? null, ['ongoing', 'completed'], true)
                ? $data['status']
                : 'ongoing',
        ];

        if ($request->hasFile('thumbnail')) {
            // When deferring, the old file stays on storage because the live
            // course still uses it until the admin approves the change.
            $attributes['thumbnail'] = $this->uploadFile(
                $request->file('thumbnail'),
                'course-thumbnails',
                $deferSensitiveMedia ? null : $course?->thumbnail,
                'public',
                ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            );
        } elseif ($course && filter_var($data['remove_thumbnail'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            if (!$deferSensitiveMedia && $course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $attributes['thumbnail'] = null;
        }

        if ($request->hasFile('preview_video')) {
            $attributes['preview_video'] = $this->uploadFile(
                $request->file('preview_video'),
                'course-previews',
                $deferSensitiveMedia ? null : $course?->preview_video,
                config('filesystems.lesson_video_disk', 'private'),
                ['video/mp4', 'video/webm', 'video/quicktime']
            );
        } elseif ($course && filter_var($data['remove_preview_video'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            if (!$deferSensitiveMedia && $course->preview_video) {
                Storage::disk(MediaDiskResolver::resolve($course, 'preview_video'))->delete($course->preview_video);
            }
            $attributes['preview_video'] = null;
        }

        return $attributes;
    }

    protected function authorizeOwner(Request $request, Course $course): void
    {
        $user = $request->user();

        abort_unless(
            (int) $course->instructor_id === (int) $user->id || $user->role === 'admin',
            403,
            'You do not own this course.'
        );
    }

    protected function presentCourse(Course $course): array
    {
        $data = $course->toArray();
        $data['category'] = $course->category ? [
            'id' => $course->category->id,
            'name' => $course->category->name,
            'slug' => $course->category->slug,
        ] : null;
        $data['category_id'] = $course->category_id;
        $data['backend_status'] = $course->status;
        $data['approval_status'] = $course->approval_status;

        // Edit requests live in their own table. A pending request keeps the
        // course approved; a rejected one surfaces its reason to the
        // instructor while the course keeps running with its approved data.
        $pendingEdit = $course->relationLoaded('pendingEditRequest')
            ? $course->pendingEditRequest
            : $course->pendingEditRequest()->first();
        $lastRejectedEdit = $course->relationLoaded('lastRejectedEditRequest')
            ? $course->lastRejectedEditRequest
            : $course->lastRejectedEditRequest()->first();

        $data['pending_changes'] = $pendingEdit?->changes;
        $data['has_pending_edit_request'] = $pendingEdit !== null;
        $data['edit_rejection_reason'] = $lastRejectedEdit?->rejection_reason;
        $data['rejection_reason'] = $course->rejection_reason
            ?? ($course->approval_status === Course::APPROVAL_APPROVED ? $lastRejectedEdit?->rejection_reason : null);
        $data['students'] = (int) ($course->enrollments_count ?? 0);
        $data['sales_count'] = (int) ($course->sales_count ?? 0);
        $data['sales'] = (int) ($course->sales_count ?? 0);
        $data['revenue'] = (float) ($course->total_revenue ?? 0);
        $data['thumbnail'] = $course->thumbnail ? url('storage/' . $course->thumbnail) : null;
        $data['preview_video'] = $course->preview_video
            ? route('courses.preview-video', ['course' => $course->id])
            : null;
        $data['status'] = $course->is_active ? 'published' : 'draft';
        $data['sections'] = $course->relationLoaded('sections')
            ? $course->sections->map(function ($section) {
                return [
                    ...$section->toArray(),
                    'lessons' => $section->lessons->map(function ($lesson) {
                        return [
                            ...$lesson->toArray(),
                            'video_url' => $lesson->video_url
                                ? route(
                                    ($lesson->is_free || $lesson->preview)
                                        ? 'lessons.video.preview'
                                        : 'lessons.video',
                                    ['lesson' => $lesson->id]
                                )
                                : null,
                        ];
                    })->values(),
                ];
            })->values()->all()
            : [];

        return $data;
    }
}
