<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InstructorProfileController extends Controller
{
    public function index(Request $request)
    {
        // Logic to retrieve and return the instructor profile

        $instructorProfile = $request->user()->instructor_profile;

        return response()->json($instructorProfile);
    }

    public function store(Request $request)
    {
        // Logic to create or update the instructor profile

        $validatedData = $request->validate([
            'bio' => 'required|string|max:1000',
            'expertise' => 'required|string|max:255',
            'social_links' => 'nullable|json',
        ]);

        $instructorProfile = $request->user()->instructor_profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validatedData
        );

        return response()->json($instructorProfile);
    }
}
