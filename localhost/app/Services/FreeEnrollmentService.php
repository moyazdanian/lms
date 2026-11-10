<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\EnrollmentConfirmationNotification;
use Illuminate\Support\Facades\DB;

/**
 * Zero-cost enrollment for free courses.
 *
 * Free courses bypass the gateway flow entirely: no order, no payment row,
 * no instructor earnings — only an active enrollment. The final price is
 * always re-derived from the current course record on the server so a
 * manipulated request can never enroll in a paid course for free.
 */
class FreeEnrollmentService
{
    /**
     * A course is free when its effective price (sale price when set,
     * otherwise the list price) is zero or below.
     */
    public static function isFree(Course $course): bool
    {
        $listPrice = max(0, (float) $course->price);
        $salePrice = $course->discount_price;

        $effective = $salePrice !== null
            && (float) $salePrice >= 0
            && (float) $salePrice < $listPrice
            ? (float) $salePrice
            : $listPrice;

        return $effective <= 0;
    }

    /**
     * Enroll the user in a free course. Idempotent: enrolling twice returns
     * the existing enrollment without a duplicate notification.
     */
    public function enroll(User $user, Course $course): array
    {
        // Same visibility rules as the public catalog: approved, active and
        // owned by a non-rejected instructor.
        $visible = Course::query()
            ->whereKey($course->getKey())
            ->publicVisible()
            ->exists();

        if (!$visible) {
            return ['success' => false, 'message' => 'This course is not available.'];
        }

        if (!self::isFree($course->refresh())) {
            return ['success' => false, 'message' => 'This course is not free.'];
        }

        return DB::transaction(function () use ($user, $course) {
            $enrollment = Enrollment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                ],
                [
                    'payment_id' => null,
                    'status' => 'active',
                ]
            );

            if ($enrollment->wasRecentlyCreated) {
                $user->notify(new EnrollmentConfirmationNotification(
                    $course->title ?? 'Unknown Course',
                    $course->slug ?? '',
                    $course->instructor?->name ?? null
                ));
            }

            return [
                'success' => true,
                'enrolled' => true,
                'already_enrolled' => !$enrollment->wasRecentlyCreated,
                'course_id' => $course->id,
                'course_slug' => $course->slug,
            ];
        });
    }
}
