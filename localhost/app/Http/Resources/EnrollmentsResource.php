<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use function PHPSTORM_META\map;

class EnrollmentsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        $user = $request->user();
        return [
            'id' => $this->id,
            'course' => new CourseResource($this->whenLoaded('course')),
            'lesson' => $user->lessonProgress->where('course_id',$this->course->id)->sortByDesc('created_at')->first()?->lesson,
            // 'section' => $user->lessonProgress()->latest()->first()->lesson(),
            'progress' => $this->progress,
            'enrolled_at' => $this->created_at,
        ];
    }
}
