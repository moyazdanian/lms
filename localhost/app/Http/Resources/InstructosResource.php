<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstructosResource extends JsonResource
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
        'name' => $this->name,
        'email' => $this->email,
        'avatar' => $this->avatar ? url('storage/' . $this->avatar) : null,
        'courses_count' => $this->courses_count,
        'total_students' => $this->total_students,
        'instructor' => $this->instructor,
        "country_code" => $this?->country_code,
        "phone" => $this?->phone,
        "role" => $this->role,
        "status" => $this?->status,
        ];
    }
}
