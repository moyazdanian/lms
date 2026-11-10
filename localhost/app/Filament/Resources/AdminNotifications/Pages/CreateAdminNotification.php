<?php

namespace App\Filament\Resources\AdminNotifications\Pages;

use App\Filament\Resources\AdminNotifications\AdminNotificationResource;
use App\Models\AdminNotification;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;

class CreateAdminNotification extends CreateRecord
{
    protected static string $resource = AdminNotificationResource::class;

    // After "Send" is clicked, if user_id is null → broadcast to everyone
    protected function handleRecordCreation(array $data): AdminNotification
    {
        if (empty($data['user_id'])) {
            // Broadcast to all students and instructors
            $users = User::whereIn('role', ['student', 'instructor'])->pluck('id');

            $notifications = $users->map(fn ($uid) => [
                'user_id'    => $uid,
                'title'      => $data['title'],
                'body'       => $data['body'],
                'type'       => $data['type'],
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();

            AdminNotification::insert($notifications);

            // Return a dummy instance so Filament doesn't error
            return new AdminNotification($data + ['user_id' => $users->first()]);
        }

        return AdminNotification::create($data);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Notification sent successfully';
    }
}
