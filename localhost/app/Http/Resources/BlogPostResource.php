<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            // The listing only needs the summary; the full RichEditor HTML
            // is heavy, so it ships from the single-post endpoint only.
            'content' => $this->when(
                $request->routeIs('blog-posts.show'),
                fn () => $this->content
            ),
            'cover_image' => $this->cover_image ? url('storage/' . $this->cover_image) : null,
            'published_at' => $this->published_at?->toIso8601String(),
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author?->id,
                'name' => $this->author?->name,
                'avatar' => $this->author?->avatar ? url('storage/' . $this->author->avatar) : null,
            ]),
        ];
    }
}
