<?php

namespace App\Http\Controllers;

use App\Http\Resources\SiteContentResource;
use App\Models\Site_content;

class SiteContentController extends Controller
{
    public function getSiteContent()
    {
        $siteContent = Site_content::query()
            ->with([
                'heroCourse1' => fn ($query) => $query
                    ->with(['category.parent', 'instructor'])
                    ->withCount('enrollments'),
                'heroCourse2' => fn ($query) => $query
                    ->with(['category.parent', 'instructor'])
                    ->withCount('enrollments'),
            ])
            ->get();

        return SiteContentResource::collection($siteContent);
    }
}
