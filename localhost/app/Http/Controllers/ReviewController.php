<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:5000'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'parent_id' => ['nullable', 'integer', 'exists:reviews,id'],
        ]);

        $user = $request->user();

        abort_unless(
            Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $data['course_id'])
                ->where(function ($query) {
                    $query->whereNull('status')
                        ->orWhereIn('status', ['active', 'completed', 'paid']);
                })
                ->exists(),
            403,
            'You must be enrolled in this course to leave a review.'
        );

        if (!empty($data['parent_id'])) {
            $parent = Review::query()->findOrFail($data['parent_id']);

            abort_unless(
                (int) $parent->course_id === (int) $data['course_id'] && $parent->parent_id === null,
                422,
                'The selected review does not belong to this course.'
            );
        }

        Review::create([
            'user_id' => $user->id,
            'course_id' => $data['course_id'],
            'comment' => $data['comment'],
            'rating' => $data['rating'],
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment saved',
        ], 201);
    }

    public function getReviews(Request $request, int $course_id)
    {
        $reviews = Review::query()
            ->with(['user:id,name,avatar', 'replies.user:id,name,avatar'])
            ->where('course_id', $course_id)
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return response()->json($reviews);
    }
}
