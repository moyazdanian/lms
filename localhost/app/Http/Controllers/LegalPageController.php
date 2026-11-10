<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use Illuminate\Http\JsonResponse;

class LegalPageController extends Controller
{
    /**
     * Public payload for one of the fixed legal texts:
     *   terms           -> /terms
     *   privacy         -> /privacy-policy
     *   cookie-consent  -> banner copy the frontend renders on the
     *                      first-visit consent dialog.
     * All of them live as columns on the single legal_pages row that the
     * admin edits in "Content > Terms & Privacy" / "Content > Cookie Consent".
     */
    public function show(string $slug): JsonResponse
    {
        // Whitelist: slug -> the fields handed back for it.
        $fields = [
            'terms' => ['terms_title', 'terms'],
            'privacy' => ['privacy_title', 'privacy'],
            'cookie-consent' => [
                'banner_title',
                'banner_body',
                'banner_accept_label',
                'banner_necessary_label',
                'banner_link_label',
            ],
        ];

        $keys = $fields[$slug] ?? null;
        if (! $keys) {
            abort(404);
        }

        $row = LegalPage::current();

        $payload = ['slug' => $slug];
        foreach ($keys as $key) {
            $payload[$key] = $row->{$key};
        }

        return response()->json(['data' => $payload]);
    }
}
