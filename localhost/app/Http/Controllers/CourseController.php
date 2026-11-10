<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Http\Resources\CoursesResource;
use App\Models\Course;
use App\Models\Enrollment;
use App\Services\ProgressService;
use App\Support\MediaDiskResolver;
use App\Support\MediaStreamer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function getCourses(Request $request)
    {

        // return $request->all();

        $data = $request->validate([
        'search' => ['nullable', 'string', 'max:100'],
        'category' => ['nullable', 'string'],
        'free' => ['nullable', 'boolean'],
        'minPrice' => ['nullable', 'numeric', 'min:0'],
        'maxPrice' => ['nullable', 'numeric'],
        'sort' => ['nullable', 'in:popular,newest,rating,price-low,price-high'],
        'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Course::publicVisible()
            ->withCount(['enrollments']);

        $search = trim($data['search'] ?? '');
        
        if(!empty($data['search'])) {
            if (mb_strlen($search) >= 3) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', $search . '%')  
                    ->orWhere('title', 'like', '% ' . $search . '%'); 
                });
            }
        }

        if(!empty($data['category'])){
            $query->whereHas('category', function ($q) use ($data){
                $q->where('slug' , $data['category']);
            });
        }

        if (($data['free'] ?? false) === true) {
            $query->where(function ($q) {
                $q->where('price', 0)
                    ->orWhere('discount_price', 0);
            });
        }

        if (!empty($data['minPrice'])) {
            $query->where(function ($q) use ($data) {
                $q->where('price', '>=', $data['minPrice'])
                    ->orWhere('discount_price', '>=', $data['minPrice']);
            });
        }

        if (!empty($data['maxPrice'])) {
            $query->where(function ($q) use ($data) {
                $q->where('price', '<=', $data['maxPrice'])
                    ->orWhere('discount_price', '<=', $data['maxPrice']);
            });
        }

        match ($data['sort'] ?? 'popular') {
            'popular' => $query->orderByDesc('enrollments_count'),
            'newest' => $query->latest(),
            'price-low' => $query->orderBy('price'),
            'price-high' => $query->orderByDesc('price'),
            default =>  $query->orderByDesc('enrollments_count'),
        };

        $maxPrice = Course::publicVisible()->max('price');

        $courses = $query->paginate($data['per_page'] ?? 2);

        return response()->json([
        'data' => CoursesResource::collection($courses)->resolve(),
        'meta' => [
            'current_page' => $courses->currentPage(),
            'last_page' => $courses->lastPage(),
            'per_page' => $courses->perPage(),
            'total' => $courses->total(),
        ],
        'filters' => [
            'max_price' => $maxPrice,
        ],
    ]);
    }

    public function getCourse(Request $request, $slug)
    {
        $course = Course::publicVisible()
            ->where('slug' , $slug)
            ->with(['sections', 'reviews', 'instructor:id,name,avatar', 'sections.lessons'])
            ->withCount(['enrollments'])
            ->withAvg('reviews', 'rating')
            ->first();

        return new CourseResource($course);
    }

    public function resume(Request $request, $slug)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['lesson' => null]);
    }

    $course = Course::where('slug', $slug)->firstOrFail();

    $progress = app(ProgressService::class)
        ->getResumeLesson($user->id, $course->id);

    // A course without lessons (or an empty install) returns nulls so the
    // frontend can hide the "Continue learning" button instead of breaking.
    return response()->json([
        'lesson' => $progress['lesson'] ?? null,
        'section' => $progress['section'] ?? null,
        'watched_seconds' => $progress['watched_seconds'] ?? 0,
        'status' => $progress['status'] ?? 'not_started',
    ]);
}

    public function check_enroll(Request $request , $courseId)
    {
        $user = $request->user();

    $isAllowed =
        $user->role === "admin"
        || Enrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->exists()
        || Course::where('id', $courseId)
            ->where('instructor_id', $user->id)
            ->exists();

    return response()->json($isAllowed);
    }

      /**
     * Stream only lessons explicitly marked as free or previewable.
     */
    public function preview(Request $request, Course $course)
    {
        abort_unless($course->is_active , 403);

        return $this->stream($request, $course);
    }

    protected function stream(Request $request, Course $course)
    {
        return MediaStreamer::serve(
            $request,
            MediaDiskResolver::resolve($course, 'preview_video'),
            $course->preview_video,
            'course-preview-' . $course->id . '.mp4',
            isPreview: true
        );
    }
}
