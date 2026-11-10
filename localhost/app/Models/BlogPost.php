<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    /**
     * Roles allowed to write posts. Only admins can open the panel today, so
     * this is the single place to edit when instructors get their own blog
     * screen: add 'instructor' and the model, the policy and the panel all
     * follow.
     */
    public const AUTHOR_ROLES = ['admin'];

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Publishing stamps the moment it went live; a scheduled post keeps
        // the date the admin picked.
        static::saving(function (BlogPost $post): void {
            if ($post->status === self::STATUS_PUBLISHED && $post->published_at === null) {
                $post->published_at = now();
            }
        });
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** Posts the storefront may show: published and not scheduled for later. */
    public function scopePublished($query)
    {
        return $query
            ->where('status', self::STATUS_PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /** Whether this user is allowed to write and manage posts. */
    public static function canBeAuthoredBy(?User $user): bool
    {
        return $user !== null && in_array($user->role, self::AUTHOR_ROLES, true);
    }
}
