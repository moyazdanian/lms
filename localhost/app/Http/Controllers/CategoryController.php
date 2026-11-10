<?php

namespace App\Http\Controllers;

use App\Http\Resources\CoursesResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function getCategories()
    {
        $categories = Category::where('parent_id' , null)->with('children')->get();

        return response()->json($categories);
    }

    public function getCategoryCourses($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $courses = $category->courses()->where('is_active', 1)->with('instructor')->get();

        return CoursesResource::collection($courses);
    }

    public function getAllCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }
}
