<?php

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;
use Illuminate\Support\Facades\URL;

/**
 * The storefront talks to the API through Caddy on the storefront origin.
 * Media URLs must therefore stay on that origin: a URL on the API host gets
 * no session cookie, the auth middleware redirects to the POST-only /login
 * route, and the player receives a 405 instead of the video.
 */
beforeEach(function () {
    config([
        'app.url' => 'https://api.example.com',
        'app.frontend_url' => 'https://example.com',
    ]);

    // AppServiceProvider pins the root to APP_URL during boot; mirror that
    // after changing the config inside the test.
    URL::forceRootUrl('https://api.example.com');
    URL::forceScheme('https');
});

function makeStorefrontMediaLesson(bool $preview = false): array
{
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = Course::create([
        'instructor_id' => $instructor->id,
        'title' => 'Media URL Course',
        'slug' => 'media-url-course-'.uniqid(),
        'description' => 'Course description',
        'price' => 100,
        'level' => 'beginner',
        'is_active' => true,
    ]);
    $section = Section::create([
        'course_id' => $course->id,
        'title' => 'Section',
        'sort_order' => 1,
    ]);
    $lesson = Lesson::create([
        'section_id' => $section->id,
        'title' => 'Lesson',
        'video_url' => 'lessons-videos/test-video.mp4',
        'duration' => 60,
        'sort_order' => 1,
        'is_free' => false,
        'preview' => $preview,
        'is_active' => true,
    ]);

    return [$course, $section, $lesson];
}

it('returns a lesson video URL on the storefront origin', function () {
    [$course, $section, $lesson] = makeStorefrontMediaLesson();

    $response = $this->getJson(
        "/api/v1/courses/{$course->slug}/sections/{$section->slug}/lessons/{$lesson->slug}"
    );

    $response->assertOk()->assertJsonPath(
        'data.video_url',
        "https://example.com/api/v1/lessons/{$lesson->id}/video"
    );
});

it('returns a preview video URL on the storefront origin', function () {
    [$course, $section, $lesson] = makeStorefrontMediaLesson(preview: true);

    $response = $this->getJson(
        "/api/v1/courses/{$course->slug}/sections/{$section->slug}/lessons/{$lesson->slug}"
    );

    $response->assertOk()->assertJsonPath(
        'data.video_url',
        "https://example.com/api/v1/lessons/{$lesson->id}/video/preview"
    );
});
