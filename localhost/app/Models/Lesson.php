<?php

namespace App\Models;

use App\Support\MediaDiskResolver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lesson extends Model
{
    public $fillable = [
        'section_id',
        'course_id',
        'title',
        'description',
        'video_url',
        'media_disk',
        'duration',
        'sort_order',
        'preview',
        'is_free',
        'is_active',
        'slug'
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'preview' => 'boolean',
        'is_active' => 'boolean',
    ];

    // public function getVideoUrlAttribute($value)
    // {
    //     if (!$value) return null;

    //     if (!str_starts_with($value, 'http')) {
    //         return Storage::disk('public')->url($value);
    //     }

    //     return $value;
    // }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function lesson_progress()
    {
        return $this->hasMany(Lesson_progress::class);
    }

    public function attachments()
    {
        return $this->hasMany(LessonAttachment::class)->orderBy('sort_order');
    }

    protected static function booted()
    {
        static::created(function ($lesson) {
            if (!$lesson->slug) {
                $lesson->update([
                    'slug' => Str::slug($lesson->title) . '-l' . $lesson->id,
                ]);
            }

            // Remember which disk the video was uploaded to so it stays
            // playable/deletable after the admin switches disks.
            if ($lesson->video_url) {
                MediaDiskResolver::stamp($lesson, 'video_url', MediaDiskResolver::currentDisk());
            }
        });

        static::updated(function ($lesson) {
            // After save (not during): the video was replaced by a new upload
            // on the current disk — remember it.
            if ($lesson->wasChanged('video_url') && $lesson->video_url) {
                MediaDiskResolver::stamp($lesson, 'video_url', MediaDiskResolver::currentDisk());
            }
        });

        // DB cascades bypass Eloquent events, so cleanup runs per row here.
        // The attachment model hook then removes each file from disk.
        static::deleting(function ($lesson) {
            $lesson->attachments()->get()->each->delete();
        });
    }
}
