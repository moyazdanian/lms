<?php

namespace App\Http\Controllers;

use App\Http\Resources\EnrollmentsResource;
use App\Http\Resources\UserResource;
use App\UploadFileTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use UploadFileTrait;

    

    public function editUserProfile(Request $request){
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            "avatar" => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user->avatar = $this->uploadFile($request->file('avatar'), 'avatars', $user->avatar);

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->phone = $request->input('phone');
        // Update other fields as necessary

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user)
        ]);
    }
}
