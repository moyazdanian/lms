<?php

namespace App\Models;

use App\Support\MediaDiskResolver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class LessonAttachment extends Model
{
    protected $table = 'lesson_resources';

    public $fillable = [
        'lesson_id',
        'title',
        'type',
        'external_url',
        'file_path',
        'media_disk',
        'original_name',
        'mime_type',
        'size_bytes',
        'downloads_count',
        'sort_order',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'downloads_count' => 'integer',
        'sort_order' => 'integer',
    ];

    /** Human readable type used by the frontend to pick an icon. */
    public function getDisplayTypeAttribute(): string
    {
        if ($this->type === 'link' || ($this->type === null && $this->file_path === null)) {
            return 'link';
        }

        return match ($this->type) {
            'pdf' => 'pdf',
            'zip' => 'zip',
            'doc' => 'doc',
            'slide' => 'slide',
            'sheet' => 'sheet',
            'text' => 'text',
            default => 'file',
        };
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Files live on the disk recorded at upload time; legacy rows are
     * resolved by probing the previous disks (see MediaDiskResolver).
     */
    public function disk(): string
    {
        return MediaDiskResolver::resolve($this, 'file_path');
    }

    protected static function booted(): void
    {
        static::created(function (LessonAttachment $attachment): void {
            // Remember which disk the file was uploaded to.
            if ($attachment->file_path) {
                MediaDiskResolver::stamp($attachment, 'file_path', MediaDiskResolver::currentDisk());
            }
        });

        static::deleting(function (LessonAttachment $attachment) {
            if ($attachment->file_path) {
                Storage::disk($attachment->disk())->delete($attachment->file_path);
            }
        });
    }
}
