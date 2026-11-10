<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\General_setting;
use App\Models\Lesson;
use App\Models\Lesson_progress;
use App\Models\Quiz;
use App\Models\User;
use App\Models\Course;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Issues course completion certificates. A certificate is granted when the
 * user has an active enrollment, every lesson of the course is completed and
 * every active quiz of the course is passed. Issuance is idempotent while the
 * certificate is valid; after an admin revocation the student may re-qualify
 * and a fresh certificate (new code + serial) is issued, while the revoked
 * record is kept for the audit trail.
 */
class CertificateService
{
    /**
     * Check eligibility and issue a certificate when all conditions are met.
     * Safe to call as often as wanted — it never issues twice and returns
     * the existing certificate on later calls.
     */
    public function checkAndIssue(int $userId, int $courseId): ?Certificate
    {
        $settings = General_setting::query()->first();

        if ($settings && !$settings->certificates_enabled) {
            return null;
        }

        if (!$this->isEligible($userId, $courseId)) {
            return null;
        }

        return $this->issue($userId, $courseId);
    }

    /**
     * Whether the user fulfilled every requirement of the course.
     */
    public function isEligible(int $userId, int $courseId): bool
    {
        // 1. Active or completed enrollment.
        $enrolled = Enrollment::query()
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if (!$enrolled) {
            return false;
        }

        // 2. Every lesson of the course completed.
        $totalLessons = Lesson::whereHas('section', function ($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->count();

        if ($totalLessons === 0) {
            return false;
        }

        $completedLessons = Lesson_progress::query()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereHas('lesson.section', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->count();

        if ($completedLessons < $totalLessons) {
            return false;
        }

        // 3. Every active quiz of the course passed at least once.
        $quizzes = Quiz::query()
            ->where('course_id', $courseId)
            ->where('is_active', true)
            ->get();

        foreach ($quizzes as $quiz) {
            if (!$quiz->isPassedBy($userId)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Issue the certificate (idempotent) with a frozen snapshot of the
     * names at issuance time and a human readable serial.
     *
     * When the previous certificate of this user/course was revoked (for
     * example after a policy violation or refund dispute) and the student
     * re-qualified, a fresh certificate is issued: the revoked record keeps
     * its serial and audit trail, and the new record gets a new code and
     * serial.
     */
    public function issue(int $userId, int $courseId): Certificate
    {
        return DB::transaction(function () use ($userId, $courseId) {
            // Re-check inside the transaction (with a row lock) to avoid race
            // duplicates. The latest certificate decides: a valid one is
            // returned as-is (idempotent), a revoked one stays untouched as
            // history and a fresh certificate is created instead.
            $existing = Certificate::query()
                ->where('user_id', $userId)
                ->where('course_id', $courseId)
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->isValid()) {
                return $existing;
            }

            $user = User::query()->findOrFail($userId);
            $course = Course::query()->findOrFail($courseId);

            $serial = $this->nextSerial();

            return Certificate::create([
                'code' => Str::uuid()->toString(),
                'serial' => $serial,
                'user_id' => $userId,
                'course_id' => $courseId,
                'snapshot' => [
                    'student_name' => $user->name,
                    'student_email' => $user->email,
                    'course_title' => $course->title,
                    'instructor_name' => $course->instructor?->name,
                    'site_name' => General_setting::query()->value('site_name') ?? config('app.name'),
                    'issued_at' => now()->toIso8601String(),
                ],
                'issued_at' => now(),
            ]);
        });
    }

    /**
     * Human readable yearly serial: CERT-2026-000001.
     */
    protected function nextSerial(): string
    {
        $year = now()->format('Y');
        $prefix = "CERT-{$year}-";

        $last = Certificate::query()
            ->where('serial', 'like', $prefix.'%')
            ->orderByDesc('serial')
            ->lockForUpdate()
            ->value('serial');

        $next = $last
            ? ((int) substr($last, strlen($prefix))) + 1
            : 1;

        return $prefix.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
