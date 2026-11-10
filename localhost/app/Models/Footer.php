<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Footer extends Model
{
    protected $table = 'footers';

    protected $fillable = [
        'about',
        'copyright',
        'links',
        'social_links',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        // Quick links [{ label, url }, ...] and social media
        // [{ platform, label, url }, ...] in display order.
        'links' => 'array',
        'social_links' => 'array',
    ];

    /**
     * The single active footer row (the table is a one-row config table).
     * Creates the default row on first access so a fresh install never
     * renders an empty footer or crashes the admin panel.
     */
    public static function current(): self
    {
        return static::query()->first()
            ?? static::create([
                'about' => 'is your gateway to explore knowledge, learn from experts, and build your future.',
                'copyright' => 'All rights reserved.',
                'links' => [
                    ['label' => 'Courses', 'url' => '/courses'],
                    ['label' => 'Instructors', 'url' => '/instructors'],
                    ['label' => 'Privacy Policy', 'url' => '/privacy-policy'],
                    ['label' => 'Terms of Service', 'url' => '/terms'],
                ],
                'social_links' => [
                    ['platform' => 'twitter', 'label' => 'Follow us on X (Twitter)', 'url' => 'https://x.com/'],
                    ['platform' => 'instagram', 'label' => 'Follow us on Instagram', 'url' => 'https://instagram.com/'],
                ],
                'is_active' => true,
            ]);
    }

    /**
     * Platforms the footer can render with a brand icon. Extend this list
     * when a new platform is needed — the frontend maps the key to its icon.
     */
    public static function platforms(): array
    {
        return [
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
            'twitter' => 'X (Twitter)',
            'linkedin' => 'LinkedIn',
            'youtube' => 'YouTube',
            'telegram' => 'Telegram',
            'github' => 'GitHub',
            'tiktok' => 'TikTok',
        ];
    }
}
