<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialAccountResource extends JsonResource
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
            'provider' => $this->provider,
            'email' => $this->provider_email,
            'avatar' => $this->avatar ? url('storage/'.$this->avatar) : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
