<?php

namespace App\Http\Controllers;

use App\Http\Resources\CartResourse;
use App\Models\Cart_item;
use App\Models\Course;
use App\Services\FreeEnrollmentService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->cartItems()->with('course')->get();

        return response()->json([
            'cart' => CartResourse::collection($items),
            'grandtotal' => $items->sum('price'),
            'subtotal' => $items->sum('final_price')
        ]);
    }

    public function store(Request $request)
    {
        $course = Course::findOrFail($request->course_id);

        // Free courses never enter the cart: they are enrolled in directly
        // with one click, which also keeps mixed (free + paid) carts from
        // ever existing.
        if (FreeEnrollmentService::isFree($course)) {
            return response()->json([
                'message' => 'This course is free — enroll directly.',
                'success' => false,
            ], 422);
        }

        // $item = $request->user()->cartItems()->where('course_id', $course->id)->exists();

        // if ($item) {
        //     return response()->json(['message' => 'The selected course is already in your cart.'], 2);
        // }

        $request->user()->cartItems()->updateOrCreate(
            ['course_id' => $course->id],
            [
                'price' => $course->price,
                'discount_price' => $course->discount_price,
                'final_price' => $course->discount_price ?? $course->price,
                'quantity' => 1,
            ]
        );

        return response()->json(['message' => 'Added to cart']);
    }

    public function destroy(Request $request, $id)
    {
        try{
        // $request->user()
        //     ->cartItems()
        //     ->where('course_id', $id)
        //     ->delete();
        $cartItem = Cart_item::where('user_id', $request->user()->id)
            ->where('course_id', $id)
            ->firstOrFail();
            $cartItem->delete();

        return response()->json(['message' => 'Removed from cart' , 'success' => true]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error removing from cart', 'error' => $e->getMessage() , 'success' => false], 500);
        }
    }

    public function clear(Request $request)
    {
        $request->user()->cartItems()->delete();
        return response()->noContent();
    }
}
