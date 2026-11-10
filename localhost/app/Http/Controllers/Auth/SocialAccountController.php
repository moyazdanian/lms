<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\SocialAccountResource;
use App\Services\SocialAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SocialAccountController extends Controller
{
    public function __construct(private SocialAuthService $socialAuth)
    {
    }

    /**
     * The signed-in user's linked providers (for the profile page).
     */
    public function index(Request $request): JsonResponse
    {
        $accounts = $request->user()->socialAccounts()->get();

        return response()->json([
            'social_accounts' => SocialAccountResource::collection($accounts),
            // The profile page uses this to decide if "Disconnect" may ever
            // leave the account without any sign-in method.
            'has_password' => $request->user()->password !== null,
        ]);
    }

    /**
     * Disconnect a linked provider. Refused when it is the user's only
     * remaining sign-in method.
     */
    public function destroy(Request $request, SocialAccount $socialAccount): JsonResponse
    {
        abort_unless($socialAccount->user_id === $request->user()->id, 403);

        if (! $this->socialAuth->canDisconnect($request->user(), $socialAccount)) {
            return response()->json([
                'message' => 'Set a password or link another provider before disconnecting your last sign-in method.',
            ], 422);
        }

        // Best-effort cleanup of the stored avatar copy.
        if ($socialAccount->avatar) {
            Storage::disk('public')->delete($socialAccount->avatar);
        }

        $socialAccount->delete();

        return response()->json(['message' => 'Account disconnected.']);
    }
}
