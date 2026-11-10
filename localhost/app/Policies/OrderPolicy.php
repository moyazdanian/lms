<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'student' || $user->role === 'instructor';
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    public function cancel(User $user, Order $order): bool
    {
        return ($user->id === $order->user_id && $order->status === 'pending')
            || $user->role === 'admin';
    }
}