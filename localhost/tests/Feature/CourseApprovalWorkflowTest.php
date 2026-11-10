<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\CourseEditRequest;
use App\Models\User;
use App\Notifications\CourseApprovalStatusNotification;
use Illuminate\Support\Facades\Notification;

function makeApprovalCourse(User $instructor, array $overrides = []): Course
{
    $category = Category::create([
        'name' => 'Approval Category ' . uniqid(),
        'slug' => 'approval-cat-' . uniqid(),
    ]);

    return Course::create(array_merge([
        'instructor_id' => $instructor->id,
        'category_id' => $category->id,
        'title' => 'Approval Course ' . uniqid(),
        'slug' => 'approval-course-' . uniqid(),
        'description' => 'Course description',
        'short_description' => 'Short desc',
        'price' => 100,
        'level' => 'beginner',
        'language' => 'English',
        'currency' => 'USD',
        'status' => 'ongoing',
        'is_active' => false,
        'approval_status' => Course::APPROVAL_PENDING,
        'submitted_for_approval_at' => now(),
    ], $overrides));
}

it('creates a private draft when saved as draft, without entering the review queue', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Cat ' . uniqid(), 'slug' => 'cat-' . uniqid()]);

    $this->actingAs($instructor, 'web')->postJson('/api/v1/instructor/courses', [
        'title' => 'Brand New Draft',
        'description' => 'Description',
        'price' => 50,
        'category_id' => $category->id,
        'level' => 'beginner',
        'currency' => 'USD',
        'intent' => 'draft',
    ])->assertCreated();

    $course = Course::where('title', 'Brand New Draft')->firstOrFail();

    // A draft is the instructor's private workspace: no review queue entry,
    // not visible anywhere public, and the lifecycle column stays untouched.
    expect($course->approval_status)->toBe(Course::APPROVAL_DRAFT)
        ->and($course->submitted_for_approval_at)->toBeNull()
        ->and($course->is_active)->toBeFalse()
        ->and($course->status)->toBe('ongoing');

    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonMissing(['title' => 'Brand New Draft']);
});

it('creates a course in pending approval when submitted, ready for admin review', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Cat ' . uniqid(), 'slug' => 'cat-' . uniqid()]);

    $this->actingAs($instructor, 'web')->postJson('/api/v1/instructor/courses', [
        'title' => 'Brand New Course',
        'description' => 'Description',
        'price' => 50,
        'category_id' => $category->id,
        'level' => 'beginner',
        'currency' => 'USD',
        'intent' => 'submit',
    ])->assertCreated();

    $course = Course::where('title', 'Brand New Course')->firstOrFail();

    expect($course->approval_status)->toBe(Course::APPROVAL_PENDING)
        ->and($course->submitted_for_approval_at)->not->toBeNull()
        ->and($course->is_active)->toBeFalse();

    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonMissing(['title' => 'Brand New Course']);

    // Admin approval publishes it.
    $admin = User::factory()->create(['role' => 'admin', 'status' => true]);
    app(App\Services\CourseApprovalService::class)->approveCourse($course, $admin->id);

    $course->refresh();

    expect($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($course->is_active)->toBeTrue();

    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonFragment(['title' => 'Brand New Course']);
});

it('keeps a draft private when saved again, and submits it only on explicit submit', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Cat ' . uniqid(), 'slug' => 'cat-' . uniqid()]);
    $course = makeApprovalCourse($instructor, [
        'approval_status' => Course::APPROVAL_DRAFT,
        'submitted_for_approval_at' => null,
    ]);

    // Re-saving the draft keeps it private.
    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => 'Draft Updated',
            'description' => 'Description',
            'price' => 50,
            'category_id' => $category->id,
            'level' => 'beginner',
            'currency' => 'USD',
            'intent' => 'draft',
        ])
        ->assertOk();

    $course->refresh();

    expect($course->approval_status)->toBe(Course::APPROVAL_DRAFT)
        ->and($course->submitted_for_approval_at)->toBeNull();

    // Submitting moves it into the admin review queue.
    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => 'Draft Updated',
            'description' => 'Description',
            'price' => 50,
            'category_id' => $category->id,
            'level' => 'beginner',
            'currency' => 'USD',
            'intent' => 'submit',
        ])
        ->assertOk();

    $course->refresh();

    expect($course->approval_status)->toBe(Course::APPROVAL_PENDING)
        ->and($course->submitted_for_approval_at)->not->toBeNull();
});

it('approves a pending course, publishes it, and notifies the instructor', function () {
    Notification::fake();

    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = makeApprovalCourse($instructor);
    $admin = User::factory()->create(['role' => 'admin', 'status' => true]);

    app(App\Services\CourseApprovalService::class)->approveCourse($course, $admin->id);

    $course->refresh();

    expect($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($course->is_active)->toBeTrue()
        ->and($course->reviewed_by)->toBe($admin->id)
        ->and($course->approved_at)->not->toBeNull();

    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonFragment(['title' => $course->title]);

    Notification::assertSentTo($instructor, CourseApprovalStatusNotification::class);
});

it('queues sensitive edits as a separate request while the course stays approved and visible', function () {
    Notification::fake();

    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Live Cat ' . uniqid(), 'slug' => 'live-cat-' . uniqid()]);
    $course = makeApprovalCourse($instructor, [
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'price' => 100,
        'title' => 'Live Title',
    ]);

    $response = $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => 'Live Title',
            'description' => 'Description',
            'price' => 30,
            'discount_price' => 20,
            'category_id' => $category->id,
            'level' => 'advanced',
            'currency' => 'USD',
        ])
        ->assertOk()
        ->assertJsonPath('pending_approval', true)
        ->assertJsonFragment(['approval_message' => 'Sensitive changes were submitted for admin review. The course keeps running with its current data until then.']);

    $course->refresh();

    // The course itself stays approved and sellable; only a separate edit
    // request is now waiting for review.
    expect($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($course->price)->toBe('100.00')
        ->and($course->title)->toBe('Live Title')
        ->and($course->pendingEditRequest)->not->toBeNull()
        ->and($course->pendingEditRequest->status)->toBe(CourseEditRequest::STATUS_PENDING)
        ->and($course->pendingEditRequest->changes['price']['old'])->toBe('100.00')
        ->and((float) $course->pendingEditRequest->changes['price']['new'])->toBe(30.0)
        ->and($course->pendingEditRequest->changes['level']['new'])->toBe('advanced');

    // The live course is still visible in the public catalog while the edit
    // request waits for review.
    $this->getJson('/api/v1/courses')
        ->assertOk()
        ->assertJsonFragment(['title' => 'Live Title']);
});

it('saves non-sensitive edits directly without admin review', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    // category_id is a sensitive field, so this test reuses the course's own
    // category and only changes non-sensitive fields.
    $course = makeApprovalCourse($instructor, [
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
    ]);

    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => $course->title,
            'description' => 'Updated description text',
            'price' => $course->price,
            'category_id' => $course->category_id,
            'level' => $course->level,
            'currency' => 'USD',
            'objectives' => ['Learn testing', 'Ship faster'],
        ])
        ->assertOk()
        ->assertJsonPath('pending_approval', false);

    $course->refresh();

    expect($course->description)->toBe('Updated description text')
        ->and($course->objectives)->toBe(['Learn testing', 'Ship faster'])
        ->and($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($course->pendingEditRequest)->toBeNull();
});

it('rejects an edit request but keeps the course approved, visible, and unmodified', function () {
    Notification::fake();

    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = makeApprovalCourse($instructor, [
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'price' => 100,
    ]);
    $editRequest = CourseEditRequest::create([
        'course_id' => $course->id,
        'instructor_id' => $instructor->id,
        'changes' => ['price' => ['old' => '100.00', 'new' => '1']],
        'status' => CourseEditRequest::STATUS_PENDING,
        'submitted_at' => now(),
    ]);
    $admin = User::factory()->create(['role' => 'admin', 'status' => true]);

    app(App\Services\CourseApprovalService::class)->rejectEditRequest($editRequest, $admin->id, 'Pricing is not acceptable.');

    $course->refresh();
    $editRequest->refresh();

    // THE REGRESSION FIX: a rejected edit request must never unpublish the
    // course or corrupt its approval status.
    expect($editRequest->status)->toBe(CourseEditRequest::STATUS_REJECTED)
        ->and($editRequest->rejection_reason)->toBe('Pricing is not acceptable.')
        ->and($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($course->is_active)->toBeTrue()
        ->and($course->price)->toBe('100.00');

    Notification::assertSentTo(
        $instructor,
        fn (CourseApprovalStatusNotification $notification) => $notification->reason === 'Pricing is not acceptable.'
    );
});

it('applies edit request changes when the admin approves it', function () {
    Notification::fake();

    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = makeApprovalCourse($instructor, [
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'price' => 100,
    ]);
    $editRequest = CourseEditRequest::create([
        'course_id' => $course->id,
        'instructor_id' => $instructor->id,
        'changes' => [
            'price' => ['old' => '100.00', 'new' => '45.50'],
            'level' => ['old' => 'beginner', 'new' => 'advanced'],
        ],
        'status' => CourseEditRequest::STATUS_PENDING,
        'submitted_at' => now(),
    ]);
    $admin = User::factory()->create(['role' => 'admin', 'status' => true]);

    app(App\Services\CourseApprovalService::class)->approveEditRequest($editRequest, $admin->id);

    $course->refresh();
    $editRequest->refresh();

    expect($course->price)->toBe('45.50')
        ->and($course->level)->toBe('advanced')
        ->and($course->approval_status)->toBe(Course::APPROVAL_APPROVED)
        ->and($editRequest->status)->toBe(CourseEditRequest::STATUS_APPROVED)
        ->and($editRequest->reviewed_by)->toBe($admin->id);
});

it('merges a second edit submission into the existing pending request', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $course = makeApprovalCourse($instructor, [
        'is_active' => true,
        'approval_status' => Course::APPROVAL_APPROVED,
        'approved_at' => now(),
        'price' => 100,
        'level' => 'beginner',
    ]);

    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => $course->title,
            'description' => 'Description',
            'price' => 80,
            'category_id' => $course->category_id,
            'level' => $course->level,
            'currency' => 'USD',
        ])
        ->assertOk();

    // Second save adjusts the price further and reverts level implicitly.
    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => $course->title,
            'description' => 'Description',
            'price' => 60,
            'category_id' => $course->category_id,
            'level' => 'beginner',
            'currency' => 'USD',
        ])
        ->assertOk();

    $course->refresh();

    $pending = $course->pendingEditRequest;

    expect($pending)->not->toBeNull()
        ->and((float) $pending->changes['price']['new'])->toBe(60.0)
        ->and($pending->changes)->toHaveKey('price')
        ->not->toHaveKey('level')
        ->and(CourseEditRequest::where('course_id', $course->id)->count())->toBe(1);
});

it('lets the instructor pick the lifecycle status (ongoing/completed) on create and update', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Cat ' . uniqid(), 'slug' => 'cat-' . uniqid()]);

    // Not sending status defaults to 'ongoing'.
    $this->actingAs($instructor, 'web')->postJson('/api/v1/instructor/courses', [
        'title' => 'Lifecycle Course ' . uniqid(),
        'description' => 'Description',
        'price' => 50,
        'category_id' => $category->id,
        'level' => 'beginner',
        'currency' => 'USD',
        'intent' => 'submit',
    ])->assertCreated();

    $course = Course::where('title', 'like', 'Lifecycle Course %')->firstOrFail();

    expect($course->status)->toBe('ongoing');

    // The instructor can flip the lifecycle to completed with a normal save
    // — it is not a sensitive field, so it applies immediately without
    // touching the approval workflow.
    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => $course->title,
            'description' => 'Description',
            'price' => 50,
            'category_id' => $course->category_id,
            'level' => 'beginner',
            'currency' => 'USD',
            'status' => 'completed',
        ])
        ->assertOk();

    $course->refresh();

    expect($course->status)->toBe('completed')
        ->and($course->approval_status)->toBe(Course::APPROVAL_PENDING);

    // Values outside the DB enum are rejected by validation before they can
    // ever reach the status column.
    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => $course->title,
            'description' => 'Description',
            'price' => 50,
            'category_id' => $course->category_id,
            'level' => 'beginner',
            'currency' => 'USD',
            'status' => 'draft',
        ])
        ->assertInvalid('status');

    $course->refresh();

    expect($course->status)->toBe('completed');
});

it('moves a rejected new course back into review after the instructor saves again', function () {
    $instructor = User::factory()->create(['role' => 'instructor', 'status' => true]);
    $category = Category::create(['name' => 'Re Cat ' . uniqid(), 'slug' => 're-cat-' . uniqid()]);
    $course = makeApprovalCourse($instructor, [
        'approval_status' => Course::APPROVAL_REJECTED,
        'rejection_reason' => 'Bad title',
    ]);

    $this->actingAs($instructor, 'web')
        ->postJson("/api/v1/instructor/courses/{$course->id}", [
            'title' => 'Better Title',
            'description' => 'Description',
            'price' => 100,
            'category_id' => $category->id,
            'level' => 'beginner',
            'currency' => 'USD',
            'intent' => 'submit',
        ])
        ->assertOk();

    $course->refresh();

    expect($course->approval_status)->toBe(Course::APPROVAL_PENDING)
        ->and($course->rejection_reason)->toBeNull()
        ->and($course->title)->toBe('Better Title');
});
