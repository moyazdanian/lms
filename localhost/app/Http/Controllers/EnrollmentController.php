<?php

namespace App\Http\Controllers;

use App\Http\Resources\EnrollmentsResource;
use App\Models\Course;
use App\Services\FreeEnrollmentService;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function userCourses(Request $request){

        $user = $request->user();

        $user->load('lessonProgress.lesson.section');

        $enrollments = $user->enrollments()->with(['course.instructor'])->latest()->paginate(10);

        return response()->json([
            'data' => EnrollmentsResource::collection($enrollments),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ]);
    }

    /**
     * One-click enrollment in a FREE course (price 0). Paid courses are
     * refused here — they must go through the gateway checkout.
     */
    public function enroll(Request $request, Course $course, FreeEnrollmentService $service)
    {
        $result = $service->enroll($request->user(), $course);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json($result);
    }
}
