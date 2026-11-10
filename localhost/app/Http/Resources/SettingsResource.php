<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingsResource extends JsonResource
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
            'site_name' => $this->site_name,
            'logo' => $this->logo ? url('storage/'. $this->logo) : null,
            'faveicon' => $this->faveicon ? url('storage/' . $this->faveicon) : null,
            'language' => $this->language,
            'currency' => $this->currency,
            'contact_email' => $this->contact_email,

            // The storefront shows the "Continue with Google" button only
            // when the admin enabled it. The client secret never leaves
            // the server (it is hidden on the model).
            'google_enabled' => (bool) ($this->google_enabled ?? false)
                || filled(config('services.google.client_id')),

        ];
    }
}
