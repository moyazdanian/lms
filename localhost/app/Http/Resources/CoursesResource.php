<?php

namespace App\Http\Resources;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoursesResource extends JsonResource
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
            'category_id' => [
                'name' => $this->category->name ?? null,
                'slug' => $this->category->slug ?? null,
                'parent' => $this->category->parent->name ?? null
            ],
            'instructor' => [
                'id' => $this->instructor_id,
                'name' => $this->instructor->name,
                'avatar' => $this->instructor->avatar ? url('storage/' . $this->instructor->avatar) : null,
            ],
            'title' => $this->title,
            'slug' => $this->slug,

            'thumbnail' => $this->thumbnail ? url('storage/' . $this->thumbnail) : null,

            'description' => $this->description,
            'price' => $this->price,
            'discount_price' => $this->discount_price,
            'status' => $this->status,
            'level' => $this->level,
            'language' => $this->language,
            'rating' => $this->rating,
            'is_active' => $this->is_active,
            'enrollments_count' => $this->enrollments_count ?? 0,
            'sales' => $this->total_revenue ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
