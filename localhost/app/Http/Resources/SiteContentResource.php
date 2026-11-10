<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteContentResource extends JsonResource
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
            'section' => $this->section,
            'visible' => (bool) $this->visible,
            'title' => $this->title,
            'highlight' => $this->highlight,
            'badge' => $this->badge,
            'search_placeholder' => $this->search_placeholder,
            'btn_text' => $this->btn_text,
            'btn_link' => $this->btn_link,
            'btn_text_2' => $this->btn_text_2,
            'btn_link_2' => $this->btn_link_2,
            'content' => $this->content,
            // The three-item features strip (only filled on the
            // features_strip row) — merged from the old features table.
            'features' => $this->when($this->section === 'features_strip', fn () => $this->features),
            'hero_course_1' => $this->whenLoaded('heroCourse1', fn () => $this->heroCourse1 ? new CoursesResource($this->heroCourse1) : null),
            'hero_course_2' => $this->whenLoaded('heroCourse2', fn () => $this->heroCourse2 ? new CoursesResource($this->heroCourse2) : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
