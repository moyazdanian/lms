<?php

use App\Http\Controllers\Auth\CookieAuthController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GeneralSettingsController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\LegalPageController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonVideoController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', [CookieAuthController::class, 'user']);
Route::middleware(['auth:sanctum' , 'throttle:reset-password'])->post('/password-reset', [NewPasswordController::class, 'store']);


Route::middleware('auth:sanctum')->post('/edit-profile' , [UserController::class , 'editUserProfile' ]);

// Manage linked OAuth providers for the signed-in user (profile page).
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('/social-accounts', [\App\Http\Controllers\Auth\SocialAccountController::class, 'index']);
    Route::delete('/social-accounts/{socialAccount}', [\App\Http\Controllers\Auth\SocialAccountController::class, 'destroy']);
});

Route::get('/categories' , [\App\Http\Controllers\CategoryController::class, 'getCategories'])
    ->name('categories.list');

Route::get('/allcategories' , [\App\Http\Controllers\CategoryController::class, 'getAllCategories']);

Route::get('/categories/{slug}/courses' , [\App\Http\Controllers\CategoryController::class, 'getCategoryCourses'])
    ->name('categories.courses');

Route::get('/courses' , [\App\Http\Controllers\CourseController::class, 'getCourses'])
    ->name('courses.list');

Route::get('/courses/{course:slug}/sections/{section:slug}/lessons/{lesson:slug}' , [LessonController::class , 'show']);

// Video files are never served from /storage. These endpoints enforce access
// and support HTTP Range requests for HTML5 video seeking.
Route::get('/lessons/{lesson}/video/preview', [LessonVideoController::class, 'preview'])
    ->name('lessons.video.preview');
Route::get('/courses/{course:slug}/video/preview', [\App\Http\Controllers\CourseController::class, 'preview'])->middleware(['throttle:video-preview'])
    ->name('course.video.preview');
Route::middleware('auth:sanctum')->get('/lessons/{lesson}/video', [LessonVideoController::class, 'show'])
    ->name('lessons.video');

// Attachment list + download for enrolled buyers, the course instructor,
// and admins (authorization mirrors LessonVideoController).
Route::middleware('auth:sanctum')->get('/lessons/{lesson}/attachments', [\App\Http\Controllers\LessonAttachmentDownloadController::class, 'index']);
Route::middleware('auth:sanctum')->get('/lessons/{lesson}/attachments/{attachment}/download', [\App\Http\Controllers\LessonAttachmentDownloadController::class, 'download'])
    ->name('lessons.attachments.download');

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/user/lesson-progress/{lesson}', [LessonProgressController::class, 'show']);
});

Route::get('/courses/{slug}/' , [\App\Http\Controllers\CourseController::class, 'getCourse'])
    ->name('courses.detail');

Route::get('/instructors' , [InstructorController::class, 'getInstructors'])
    ->name('instructors.list');
    
Route::get('/instructor/{id}' , [InstructorController::class , 'getInstructor'])
    ->whereNumber('id')
    ->name('instructor.detail');

// The features strip ships with the site-content payload (features key on
// the features_strip row); the old /features endpoint was removed.

Route::get('/site-content' , [\App\Http\Controllers\SiteContentController::class, 'getSiteContent'])
    ->name('site.content');

// The whole footer (texts, quick links, social links) in one payload.
Route::get('/footer' , [\App\Http\Controllers\FooterController::class, 'show'])
    ->name('footer.show');

// ---- Blog: admin-written posts (published ones only) ----
Route::get('/blog-posts', [\App\Http\Controllers\BlogPostController::class, 'index'])
    ->name('blog-posts.index');
Route::get('/blog-posts/{slug}', [\App\Http\Controllers\BlogPostController::class, 'show'])
    ->name('blog-posts.show');

// ---- Admin-written legal text: terms | privacy | cookie-consent ----
Route::get('/legal-pages/{slug}', [LegalPageController::class, 'show'])
    ->where('slug', 'terms|privacy|cookie-consent')
    ->name('legal-pages.show');

Route::middleware('auth:sanctum')->group(function(){
        Route::post('/coupon-apply' , [\App\Http\Controllers\CouponController::class, 'apply']);
        Route::get('/coupon' , [\App\Http\Controllers\CouponController::class, 'show']);
        Route::delete('/coupon' , [\App\Http\Controllers\CouponController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
});

Route::middleware('auth:sanctum')->group(function (){
    Route::post('/wishlist' , [WishlistController::class , 'addToWishlist' ]);
    Route::delete('/wishlist/{course_id}' , [WishlistController::class , 'removeFromWishlist' ]);
    Route::get('/wishlist' , [WishlistController::class , 'getWishlistItems' ]);
    Route::get('/wishlist/ids' , [WishlistController::class , 'getWishlistIds' ]);
});

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/dashboard/courses' , [EnrollmentController::class , 'userCourses']);
});

Route::middleware(['auth:sanctum', 'throttle:review'])->post('/review', [ReviewController::class, 'store']);
Route::get('/review/{course_id}' , [ReviewController::class , 'getReviews']);

// ---- Quizzes (end-of-course) ----
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/courses/{course:slug}/quiz', [\App\Http\Controllers\StudentQuizController::class, 'show']);
    Route::post('/courses/{course:slug}/quiz/attempts', [\App\Http\Controllers\StudentQuizController::class, 'submit']);
    Route::get('/courses/{course:slug}/quiz/attempts', [\App\Http\Controllers\StudentQuizController::class, 'history']);
    Route::get('/courses/{course:slug}/quiz/review', [\App\Http\Controllers\StudentQuizController::class, 'review']);
    Route::get('/courses/{course:slug}/certificate-eligibility', [\App\Http\Controllers\StudentQuizController::class, 'eligibility']);

    Route::get('/my-certificates', [\App\Http\Controllers\CertificateController::class, 'index']);
    Route::get('/certificates/{certificate:code}/download', [\App\Http\Controllers\CertificateController::class, 'download'])
        ->name('certificates.download');
});

// Public verification — the code is an unguessable UUID, no auth needed.
Route::get('/verify-certificate/{code}', [\App\Http\Controllers\CertificateController::class, 'verify']);

// Rate limit payment initiation to prevent abuse
Route::middleware(['auth:sanctum', 'throttle:auth'])->post('/payment' , [PaymentController::class , 'initiate']);
Route::middleware('auth:sanctum')->get('/payment/verify' , [PaymentController::class , 'verify']);
Route::middleware('auth:sanctum')->post('/payments/cancel', [PaymentController::class, 'cancel']);
Route::middleware('auth:sanctum')->get('/payments' , [PaymentController::class , 'userPayments']);

// Which payment gateways are enabled in the admin panel right now.
Route::get('/payment-methods' , [PaymentController::class , 'methods']);

Route::post('/webhooks/stripe' , [App\Http\Controllers\StripeWebhookController::class , 'handle']);
Route::post('/webhooks/mollie' , [App\Http\Controllers\GatewayWebhookController::class , 'mollie'])->name('webhooks.mollie');

// Rate limit instructor application (public endpoint - prevent spam)
Route::middleware(['auth:sanctum', 'throttle:auth'])->group(function () {
    Route::get('/instructor-application', [App\Http\Controllers\InstructorApplicationController::class, 'show']);
    Route::post('/instructor-application', [App\Http\Controllers\InstructorApplicationController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:instructor,admin', 'instructor.active'])->prefix('instructor')->group(function () {
    Route::get('/earnings', [App\Http\Controllers\Instructor\PayoutController::class, 'index']);
    Route::get('/earnings/chart', [App\Http\Controllers\Instructor\PayoutController::class, 'revenueChart']);
    Route::get('/sales/chart', [App\Http\Controllers\Instructor\PayoutController::class, 'salesChart']);
    Route::get('/enrollment/chart', [App\Http\Controllers\Instructor\PayoutController::class, 'enrollmentChart']);
    Route::get('/top-performing-courses', [App\Http\Controllers\Instructor\PayoutController::class, 'topPerformingCourses']);
    Route::get('/recent-sales', [App\Http\Controllers\Instructor\PayoutController::class, 'recentSeles']);
    Route::get('/instructor-sales', [App\Http\Controllers\Instructor\PayoutController::class, 'instructorSeles']);
    Route::get('/course-options', [App\Http\Controllers\Instructor\PayoutController::class, 'courseOptions']);
    Route::get('/payout-requests', [App\Http\Controllers\Instructor\PayoutController::class, 'requests']);
    Route::post('/payout-requests', [App\Http\Controllers\Instructor\PayoutController::class, 'store']);
    Route::get('/courses', [App\Http\Controllers\Instructor\CourseController::class, 'index']);
    Route::post('/courses', [App\Http\Controllers\Instructor\CourseController::class, 'store']);
    Route::get('/courses/{course}', [App\Http\Controllers\Instructor\CourseController::class, 'show']);
    Route::get('/courses/{course}/preview-video', [App\Http\Controllers\CoursePreviewVideoController::class, 'show'])
        ->name('courses.preview-video');
    Route::post('/courses/{course}', [App\Http\Controllers\Instructor\CourseController::class, 'update']);
    Route::delete('/courses/{course}', [App\Http\Controllers\Instructor\CourseController::class, 'destroy']);

    Route::post('/courses/{course}/sections', [App\Http\Controllers\Instructor\SectionController::class, 'store']);
    Route::put('/sections/{section}', [App\Http\Controllers\Instructor\SectionController::class, 'update']);
    Route::delete('/sections/{section}', [App\Http\Controllers\Instructor\SectionController::class, 'destroy']);

    Route::post('/sections/{section}/lessons', [App\Http\Controllers\Instructor\LessonController::class, 'store']);
    Route::post('/lessons/{lesson}', [App\Http\Controllers\Instructor\LessonController::class, 'update']);
    Route::delete('/lessons/{lesson}', [App\Http\Controllers\Instructor\LessonController::class, 'destroy']);

    // Lesson attachments (files students can download after purchase)
    Route::get('/lessons/{lesson}/attachments', [App\Http\Controllers\Instructor\LessonAttachmentController::class, 'index']);
    Route::post('/lessons/{lesson}/attachments', [App\Http\Controllers\Instructor\LessonAttachmentController::class, 'store']);
    Route::post('/attachments/{attachment}', [App\Http\Controllers\Instructor\LessonAttachmentController::class, 'update']);
    Route::delete('/attachments/{attachment}', [App\Http\Controllers\Instructor\LessonAttachmentController::class, 'destroy']);

    Route::get('/instructor-profile', [App\Http\Controllers\Instructor\InstructorProfileController::class, 'index']);
    Route::post('/instructor-profile', [App\Http\Controllers\Instructor\InstructorProfileController::class, 'store']);

    // Quiz editor of a course (one quiz per course in v1)
    Route::get('/courses/{course}/quiz', [App\Http\Controllers\Instructor\InstructorQuizController::class, 'show']);
    Route::post('/courses/{course}/quiz', [App\Http\Controllers\Instructor\InstructorQuizController::class, 'save']);
});
Route::middleware('auth:sanctum')->get('/get-orders' , [OrderController::class , 'getOrders']);

Route::get('/settings' , [GeneralSettingsController::class , 'getSettings']);
Route::get('/settingsData' , [GeneralSettingsController::class , 'getCoursesBySetting']);

Route::middleware('auth:sanctum')->post(
    '/lessons/{lesson}/progress',
    [LessonProgressController::class, 'update']
);

Route::middleware('auth:sanctum')
    ->get('/courses/{slug}/resume', [CourseController::class, 'resume'])
    ->name('courses.resume');
Route::middleware('auth:sanctum')->get('/course/{course}/check-enroll' , [CourseController::class , 'check_enroll']);

// One-click enrollment in FREE courses (price 0) — no cart, no gateway.
Route::middleware('auth:sanctum')
    ->post('/courses/{course}/enroll', [EnrollmentController::class, 'enroll']);

// ---- Notifications ----
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markRead']);
});

// ---- Support Tickets ----
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tickets', [App\Http\Controllers\SupportTicketController::class, 'index']);
    Route::post('/tickets', [App\Http\Controllers\SupportTicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [App\Http\Controllers\SupportTicketController::class, 'show']);
    Route::post('/tickets/{ticket}/messages', [App\Http\Controllers\SupportTicketController::class, 'reply']);
    Route::post('/tickets/{ticket}/close', [App\Http\Controllers\SupportTicketController::class, 'close']);
});

// ---- GDPR: Data Export & Account Deletion ----
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/gdpr/export', [App\Http\Controllers\GdprController::class, 'export']);
    Route::delete('/gdpr/account', [App\Http\Controllers\GdprController::class, 'destroy']);
});

// ---- GDPR notice page content ----
