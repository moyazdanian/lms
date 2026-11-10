<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstructorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this?->email,
            "instructor" => [
                'bio' => $this->instructor->bio ?? null,
                'expertise' => $this->instructor->expertise ?? null,
                'social_links' => $this->instructor->social_links ?? null,
            ],
            "avatar" => url($this?->avatar),
            "country_code" => $this?->country_code,
            "phone" => $this?->phone,
            "role" => $this->role,
            "status" => $this?->status,
            "courses" => CoursesResource::collection($this->whenLoaded('courses')),
        ];
        
    }
}
