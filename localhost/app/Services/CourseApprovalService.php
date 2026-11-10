<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseEditRequest;
use App\Notifications\CourseApprovalStatusNotification;
use App\Notifications\CourseEditRequestNotification;
use App\Support\MediaDiskResolver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Central place for the two approval workflows so the Filament panel and any
 * future API surface share the exact same rules:
 *
 *  1. Course approval     — new course submissions (courses.approval_status).
 *  2. Edit request review — sensitive edits on live courses, each tracked as a
 *     row in course_edit_requests. A rejected request never touches the live
 *     course: it keeps running with its approved data.
 */
class CourseApprovalService
{
    /** Course media columns managed through the review workflow. */
    public const MEDIA_FIELDS = ['thumbnail', 'preview_video'];

    /**
     * Collect the sensitive-field changes between the current course state
     * and a proposed attribute set. Returns [field => ['old' => x, 'new' => y]].
     */
    public function diffSensitiveChanges(Course $course, array $proposed): array
    {
        $changes = [];

        foreach (Course::SENSITIVE_FIELDS as $field) {
            if (!array_key_exists($field, $proposed)) {
                continue;
            }

            $old = $this->normalizeForComparison($field, $course->{$field});
            $new = $this->normalizeForComparison($field, $proposed[$field]);

            if ($old === $new) {
                continue;
            }

            $changes[$field] = [
                'old' => $course->{$field},
                'new' => $proposed[$field],
            ];
        }

        return $changes;
    }

    /**
     * Store a pending edit request for a live course. Previously pending
     * changes of the same instructor are merged (new values overwrite, fields
     * sent back at their live value are dropped); when nothing remains the
     * existing pending request is simply deleted.
     */
    public function submitEditRequest(Course $course, array $changes, array $reverted = []): ?CourseEditRequest
    {
        return DB::transaction(function () use ($course, $changes, $reverted) {
            /** @var CourseEditRequest|null $request */
            $request = CourseEditRequest::query()
                ->where('course_id', $course->id)
                ->where('status', CourseEditRequest::STATUS_PENDING)
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            $merged = $request?->changes ?? [];

            foreach ($reverted as $field) {
                unset($merged[$field]);
            }

            foreach ($changes as $field => $change) {
                $merged[$field] = $change;
            }

            if ($merged === []) {
                // Nothing is awaiting review anymore; drop the empty request.
                $request?->delete();

                return null;
            }

            if ($request) {
                $request->fill([
                    'changes' => $merged,
                    'submitted_at' => now(),
                ])->save();

                return $request;
            }

            return CourseEditRequest::create([
                'course_id' => $course->id,
                'instructor_id' => $course->instructor_id,
                'changes' => $merged,
                'status' => CourseEditRequest::STATUS_PENDING,
                'submitted_at' => now(),
            ]);
        });
    }

    /**
     * Admin approves a NEW course submission: mark approved and publish.
     */
    public function approveCourse(Course $course, int $adminId): Course
    {
        return DB::transaction(function () use ($course, $adminId) {
            $course = Course::whereKey($course->getKey())->lockForUpdate()->firstOrFail();

            $course->forceFill([
                'approval_status' => Course::APPROVAL_APPROVED,
                'rejection_reason' => null,
                'reviewed_by' => $adminId,
                'approved_at' => now(),
                'is_active' => true,
            ])->save();

            $instructor = $course->instructor;

            DB::afterCommit(function () use ($instructor, $course): void {
                $instructor?->notify(new CourseApprovalStatusNotification(
                    $course->id,
                    (string) $course->title,
                    'approved'
                ));
            });

            return $course;
        });
    }

    /**
     * Admin rejects a NEW course submission.
     */
    public function rejectCourse(Course $course, int $adminId, string $reason): Course
    {
        return DB::transaction(function () use ($course, $adminId, $reason) {
            $course = Course::whereKey($course->getKey())->lockForUpdate()->firstOrFail();

            $course->forceFill([
                'approval_status' => Course::APPROVAL_REJECTED,
                'rejection_reason' => $reason,
                'reviewed_by' => $adminId,
            ])->save();

            $course->instructor?->notify(new CourseApprovalStatusNotification(
                $course->id,
                (string) $course->title,
                'rejected',
                $reason
            ));

            return $course;
        });
    }

    /**
     * Admin approves an edit request: apply the queued values to the live
     * course and clean up the replaced media files.
     */
    public function approveEditRequest(CourseEditRequest $editRequest, int $adminId): CourseEditRequest
    {
        return DB::transaction(function () use ($editRequest, $adminId) {
            $editRequest = CourseEditRequest::whereKey($editRequest->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($editRequest->status !== CourseEditRequest::STATUS_PENDING) {
                return $editRequest;
            }

            $course = Course::whereKey($editRequest->course_id)->lockForUpdate()->firstOrFail();
            $changes = is_array($editRequest->changes) ? $editRequest->changes : [];

            $applies = [];

            foreach ($changes as $field => $change) {
                if (in_array($field, Course::SENSITIVE_FIELDS, true) && array_key_exists('new', $change)) {
                    $applies[$field] = $change['new'];
                }
            }

            if ($applies !== []) {
                $course->fill($applies)->save();
            }

            $editRequest->forceFill([
                'status' => CourseEditRequest::STATUS_APPROVED,
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
            ])->save();

            $this->cleanupMedia($changes, $course, keep: 'new');

            $instructor = $course->instructor;

            DB::afterCommit(function () use ($instructor, $course): void {
                $instructor?->notify(new CourseEditRequestNotification(
                    $course->id,
                    (string) $course->title,
                    'approved'
                ));
            });

            return $editRequest;
        });
    }

    /**
     * Admin rejects an edit request: the live course keeps running with its
     * approved data and the uploaded replacement media is removed.
     */
    public function rejectEditRequest(CourseEditRequest $editRequest, int $adminId, string $reason): CourseEditRequest
    {
        return DB::transaction(function () use ($editRequest, $adminId, $reason) {
            $editRequest = CourseEditRequest::whereKey($editRequest->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($editRequest->status !== CourseEditRequest::STATUS_PENDING) {
                return $editRequest;
            }

            $course = Course::whereKey($editRequest->course_id)->lockForUpdate()->firstOrFail();
            $changes = is_array($editRequest->changes) ? $editRequest->changes : [];

            $editRequest->forceFill([
                'status' => CourseEditRequest::STATUS_REJECTED,
                'rejection_reason' => $reason,
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
            ])->save();

            // The uploaded replacement was never applied, so remove it.
            $this->cleanupMedia($changes, $course, keep: 'old');

            $course->instructor?->notify(new CourseEditRequestNotification(
                $course->id,
                (string) $course->title,
                'rejected',
                $reason
            ));

            return $editRequest;
        });
    }

    /**
     * Legacy helpers kept for compatibility with existing call sites/tests
     * that act directly on the course. New submissions have no pending edit
     * requests, so approve/reject resolve to the course-level workflow.
     */
    public function approve(Course $course, int $adminId): Course
    {
        return $this->approveCourse($course, $adminId);
    }

    public function reject(Course $course, int $adminId, string $reason): Course
    {
        return $this->rejectCourse($course, $adminId, $reason);
    }

    /**
     * Delete queued media files that are no longer referenced.
     * keep='new' (approve) removes the old live file; keep='old' (reject)
     * removes the uploaded replacement.
     */
    protected function cleanupMedia(array $changes, Course $course, string $keep): void
    {
        foreach (self::MEDIA_FIELDS as $field) {
            if (!isset($changes[$field])) {
                continue;
            }

            $remove = $keep === 'new'
                ? ($changes[$field]['old'] ?? null)
                : ($changes[$field]['new'] ?? null);

            if (!$remove || $remove === ($course->{$field} ?? null)) {
                continue;
            }

            $disk = $field === 'thumbnail'
                ? Storage::disk('public')
                // The file being removed may predate a disk switch and is not
                // the course's current file — resolve where IT actually lives.
                : Storage::disk(MediaDiskResolver::resolveForPath($remove));

            try {
                $disk->delete($remove);
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    protected function normalizeForComparison(string $field, mixed $value): mixed
    {
        return match ($field) {
            'price', 'discount_price' => $value === null ? null : (float) $value,
            'category_id' => $value === null ? null : (int) $value,
            default => $value,
        };
    }
}
