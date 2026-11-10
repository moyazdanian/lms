<?php

namespace App\Http\Controllers;

use App\Models\InstructorApplication;
use Illuminate\Http\Request;

class InstructorApplicationController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $application = InstructorApplication::where('user_id', $user->id)->latest()->first();

        return response()->json([
            'application' => $application,
            'is_instructor' => in_array($user->role, ['instructor', 'admin'], true),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (in_array($user->role, ['instructor', 'admin'], true)) {
            return response()->json([
                'message' => 'You are already an instructor.',
            ], 422);
        }

        $validated = $request->validate([
            'bio' => ['required', 'string', 'min:50'],
            'expertise' => ['required', 'string', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.*' => ['nullable', 'url', 'max:255'],
        ]);

        $existing = InstructorApplication::where('user_id', $user->id)->first();

        if ($existing && in_array($existing->status, ['pending', 'approved'], true)) {
            return response()->json([
                'message' => $existing->status === 'pending'
                    ? 'Your application is already under review.'
                    : 'Your application has already been approved.',
            ], 422);
        }

        $data = [
            'bio' => $validated['bio'],
            'expertise' => $validated['expertise'],
            'social_links' => array_filter($validated['social_links'] ?? []),
            'status' => 'pending',
            'admin_note' => null,
        ];
        
        $application = InstructorApplication::create($data + ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Your application has been submitted.',
            'application' => $application,
        ], 201);
    }
}
