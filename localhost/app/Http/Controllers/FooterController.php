<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class FooterController extends Controller
{
    /**
     * The whole footer in one payload — texts, quick links and social links
     * from the standalone footers table (single active row).
     */
    public function show(): JsonResponse
    {
        $footer = \App\Models\Footer::current();

        return response()->json([
            'data' => [
                'about' => $footer->about,
                'copyright' => $footer->copyright,
                'links' => $footer->links ?? [],
                'social_links' => $footer->social_links ?? [],
                'is_active' => (bool) $footer->is_active,
            ],
        ]);
    }
}
