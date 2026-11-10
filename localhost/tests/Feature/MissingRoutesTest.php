<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

it('registers the course resume route under the versioned API prefix', function () {
    expect(Route::has('courses.resume'))->toBeTrue();
});

it('requires authentication for course resume', function () {
    $this->getJson('/api/v1/courses/example-course/resume')
        ->assertUnauthorized();
});

it('does not expose the removed lesson progress store route', function () {
    expect(Route::has('lesson-progress.store'))->toBeFalse();
});
