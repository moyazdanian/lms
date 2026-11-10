<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    protected $user;

    public function __construct($resource, $user)
    {
        parent::__construct($resource);
        $this->user = $user;
    }
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $progress = $this->lesson_progress->first();

        // Attachments exist only on paid lessons; free previews never carry files.
        $attachments = $this->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'title' => $attachment->title,
                'display_type' => $attachment->display_type,
                'original_name' => $attachment->original_name,
                'size_bytes' => $attachment->size_bytes,
                'downloads_count' => $attachment->downloads_count,
                'download_url' => route('lessons.attachments.download', [
                    'lesson' => $this->id,
                    'attachment' => $attachment->id,
                ]),
            ])->values();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'video_url' => $this->video_url
                ? route(
                    ($this->is_free || $this->preview)
                        ? 'lessons.video.preview'
                        : 'lessons.video',
                    ['lesson' => $this->id]
                )
                : null,
            'duration' => $this->duration,
            'is_free' => (bool) $this->is_free,

            'progress' => $progress ? [
                'watched_seconds' => $progress->watched_seconds,
                'status' => $progress->status,
            ] : null,
            'attachments' => $attachments,
        ];
    }
}
