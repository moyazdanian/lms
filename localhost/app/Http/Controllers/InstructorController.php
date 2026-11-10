<?php

namespace App\Http\Controllers;

use App\Http\Resources\InstructosResource;
use App\Models\User;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    public function getInstructors()
    {
        $instructors = User::whereIn('role', ['instructor', 'admin'])
            ->whereHas('instructor', function ($q) {
                $q->where('status', '!=', 'rejected');
            })
            ->with(['instructor'])
            ->withCount(['courses'])
            ->addSelect([
                'total_students' => function ($query) {
                    $query->selectRaw('COUNT(DISTINCT enrollments.user_id)')
                        ->from('courses')
                        ->join('enrollments', 'courses.id', '=', 'enrollments.course_id')
                        ->whereColumn('courses.instructor_id', 'users.id');
                },
            ])
            ->latest()
            ->get();

            return response()->json(InstructosResource::collection($instructors));

        // return response()->json( \App\Http\Resources\InstructorResource::collection($instructors));
    }

    public function getInstructor($id)
    {
        $instructor = User::where('id', $id)
            ->whereHas('instructor', function ($q) {
                $q->where('status', '!=', 'rejected');
            })
            ->with(['courses', 'instructor'])
            ->firstOrFail();

        return new \App\Http\Resources\InstructorResource($instructor);
    }
}
