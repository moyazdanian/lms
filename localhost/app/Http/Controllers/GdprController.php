<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Support\MediaDiskResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class GdprController extends Controller
{
    /**
     * Export all personal data for the authenticated user (Right to Access / Portability)
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $user->load([
            'enrollments.course:id,title,slug',
            'orders:id,user_id,amount,status,created_at',
            'wishlist.course:id,title,slug',
            'reviews.course:id,title,slug',
            'instructor' => function ($q) {
                $q->select(['id', 'user_id', 'bio', 'expertise', 'status']);
            },
            'supportTickets:id,user_id,subject,status,created_at',
            'notifications:id,user_id,title,body,type,read_at,created_at',
        ]);

        $data = [
            'user' => (new UserResource($user))->toArray($request),
            'profile' => [
                'bio' => $user->instructor?->bio,
                'expertise' => $user->instructor?->expertise,
                'social_links' => $user->instructor?->social_links,
            ],
        ];

        $export = [
            'exported_at' => now()->toISOString(),
            'user_id' => $user->id,
            'personal_data' => $data,
        ];

        return response()->json($export)
            ->header('Content-Disposition', 'attachment; filename="personal-data-export.json"');
    }

    /**
     * Delete the authenticated user's account and all associated data (Right to Erasure)
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password before destructive action
        if (!password_verify($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password. Account deletion requires password confirmation.',
            ], 403);
        }

        // Prevent instructors with active students from immediate deletion
        if ($user->role === 'instructor') {
            $activeEnrollments = $user->courses()
                ->withCount('enrollments')
                ->get()
                ->sum('enrollments_count');

            if ($activeEnrollments > 0) {
                return response()->json([
                    'message' => 'Cannot delete account: You have active students enrolled in your courses. Please contact support to transfer or archive your courses first.',
                ], 422);
            }
        }

        return DB::transaction(function () use ($user) {
            // Delete uploaded files (avatar, instructor profile files)
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Delete instructor courses and their files
            foreach ($user->courses as $course) {
                if ($course->thumbnail) {
                    Storage::disk('public')->delete($course->thumbnail);
                }
                foreach ($course->sections as $section) {
                    foreach ($section->lessons as $lesson) {
                        if ($lesson->video_url) {
                            Storage::disk(MediaDiskResolver::resolve($lesson, 'video_url'))->delete($lesson->video_url);
                        }

                        $lesson->attachments()->get()->each->delete();
                    }
                }
            }

            // Delete the user (cascade handles most related data)
            $user->delete();

            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Your account and all associated data have been permanently deleted.',
            ]);
        });
    }
}