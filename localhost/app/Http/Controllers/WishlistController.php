<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWishlistRequest;
use App\Http\Resources\WishlistResource;
use App\Models\Wishlist;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function addToWishlist(StoreWishlistRequest $request)
    {
        try{
            Wishlist::create([
                'user_id' => $request->user()->id,
                'course_id' => $request->course_id,
            ]);
             return response()->json(['message' => 'Item added to wishlist'] , 201);
        } catch (QueryException $e) {
            return response()->json(['message' => 'Already exists in your wishlist' , 'error' => $e->getMessage()], 409);
        }
       
    }

    public function removeFromWishlist(Request $request, $course_id)
    {

            $wishlistItem = Wishlist::where('user_id', $request->user()->id)
                ->where('course_id', $course_id)->firstOrFail();

            if($request->user()->cannot('delete', $wishlistItem)){
                return response()->json(['message' => 'Unauthorized'] , 403);
            }

            $wishlistItem->delete();

            return response()->json(['message' => 'Item removed from wishlist'] , 200);
        
    }

    public function getWishlistItems(Request $request)
    {
        $wishlistItems = Wishlist::with('course')
            ->where('user_id', $request->user()->id)
            ->latest()->paginate(10);

        return response()->json([
            'data' => WishlistResource::collection($wishlistItems),
            'meta' => [
                'current_page' => $wishlistItems->currentPage(),
                'last_page' => $wishlistItems->lastPage(),
                'per_page' => $wishlistItems->perPage(),
                'total' => $wishlistItems->total(),
            ],
        ]);
    }

    public function getWishlistIds(Request $request)
    {
        $wishlistIds = Wishlist::where('user_id', $request->user()->id)
            ->pluck('course_id');

        return response()->json([
            'data' => $wishlistIds,
        ]);
    }
}
