<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications
    public function index(Request $request)
    {
         $user = $request->user();

         $notifications = $user->notifications()
        ->latest()
        ->paginate(8);

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'data' => $notifications->getCollection()->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'notifiable_type' => $notification->notifiable_type,
                    'notifiable_id' => $notification->notifiable_id,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at,
                ];
            })->values(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
        ],
            'unread_count'  => $unreadCount,
        ]);
    }

    // POST /api/notifications/{id}/read
    public function markRead(Request $request, string $notification)
    {
         $notification = $request->user()
        ->notifications()
        ->where('id', $notification)
        ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
        ]);
    }

    // POST /api/notifications/read-all
    public function markAllRead(Request $request)
    {
        $request->user()
        ->unreadNotifications()
        ->update([
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }
}
