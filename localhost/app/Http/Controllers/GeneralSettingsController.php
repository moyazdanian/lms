<?php

namespace App\Http\Controllers;

use App\Http\Resources\CoursesResource;
use App\Http\Resources\SettingsResource;
use App\Models\Category;
use App\Models\Course;
use App\Models\General_setting;
use App\Models\Site_content;
use Illuminate\Http\Request;

class GeneralSettingsController extends Controller
{
    public function getSettings(){
        $settings = General_setting::first();

        $categories = Category::where('parent_id' , null)->with('children')->get();

        return response()->json([
            'settings' => new SettingsResource($settings),
            'categories' => $categories
        ]);
    }

    public function getCoursesBySetting(){

    $settings = General_setting::first();

    $data = [];

    if (Site_content::where('section', 'latest_courses')->where('visible', true)->exists()) {
        $data['latest_courses'] = $this->latestCourses();
    }

    if (Site_content::where('section', 'popular_courses')->where('visible', true)->exists()) {
        $data['popular_courses'] = $this->popularCourses();
    }

    if (Site_content::where('section', 'featured_courses')->where('visible', true)->exists()) {
        $data['featured_courses'] = $this->featuredCourses();
    }

    return response()->json($data);
    }

    public function latestCourses(){
        $latestCourses = Course::publicVisible()
            ->withCount(['enrollments'])->latest()->take(30)->get();

        return CoursesResource::collection($latestCourses);
    }

    public function popularCourses(){
        $popularCourses = Course::publicVisible()
            ->withCount(['enrollments'])->orderByDesc('enrollments_count')->take(8)->get();

        return CoursesResource::collection($popularCourses);
    }

    public function featuredCourses(){
        $featuredCourses = Course::publicVisible()
            ->withCount(['enrollments'])->where('is_featured', true)->get();

        return CoursesResource::collection($featuredCourses);
    }
    
}
