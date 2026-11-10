<?php

namespace App\Http\Resources;

use App\Models\Lesson_progress;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CourseResource extends JsonResource
{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request ): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'thumbnail' => $this->thumbnail ? url('storage/' . $this->thumbnail) : null,
            'language' => $this->language,
            'level' => $this->level,
            'requirements' => $this->requirements,
            'objectives' => $this->objectives,
            'tags' => $this->tags,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'category_id' => $this->category?->name ?? null, // ✅ فقط نام دسته
            'instructor' => [
                'id' => $this->instructor->id ?? null,
                'name' => $this->instructor->name ?? null,
                'avatar' => $this->instructor->avatar
                    ? url('storage/' . $this->instructor->avatar)
                    : null,
            ],
            'sections' => $this->whenLoaded('sections', function () {
                return $this->sections->map(function ($section)  {
                    return [
                        'id' => $section->id,
                        'title' => $section->title,
                        'slug' => $section->slug,
                        'lessons' => $section->lessons->map(function ($lesson) {
                            return [
                                    'id' => $lesson->id,
                                    'title' => $lesson->title,
                                    'duration' => $lesson->duration,
                                    'slug' => $lesson->slug,
                                    'preview' => (bool) $lesson->preview,
                                    'video_url' => $this->lessonVideoUrl($lesson),
                                    'is_free' => (bool) $lesson->is_free,
                                ];
                        }),
                    ];
                });
            }),
            'preview' => $this->preview_video ? route('course.video.preview', ['course' => $this->slug]) : null,

            'reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'user' => new UserResource($review->user),
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at,
                        'replies' => $review->replies->map(function ($reply) {
                            return [
                                'id' => $reply->id,
                                'user' => new UserResource($reply->user),
                                'comment' => $reply->comment,
                                'created_at' => $reply->created_at
                            ];
                        })
                    ];
                });
            }),
            'enrollments_count' => $this->enrollments_count ?? 0,
            'rating' => $this->rating ?? null,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function lessonVideoUrl($lesson): ?string
    {
        if (!$lesson->video_url) {
            return null;
        }

        $route = ($lesson->is_free || $lesson->preview)
            ? 'lessons.video.preview'
            : 'lessons.video';

        return route($route, ['lesson' => $lesson->id]);
    }
}
