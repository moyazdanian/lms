<?php

namespace App\Policies;

use App\Models\BlogPost;
use App\Models\User;

/**
 * Who may write posts. Today BlogPost::AUTHOR_ROLES holds only 'admin', so
 * this is admin-only; adding 'instructor' there is enough to open it up,
 * because the panel checks these methods rather than a hardcoded role.
 */
class BlogPostPolicy
{
    public function viewAny(User $user): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }

    public function view(User $user, BlogPost $post): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }

    public function create(User $user): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }

    public function update(User $user, BlogPost $post): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }

    public function delete(User $user, BlogPost $post): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }

    public function deleteAny(User $user): bool
    {
        return BlogPost::canBeAuthoredBy($user);
    }
}
