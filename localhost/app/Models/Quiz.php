<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'pass_mark',
        'max_attempts',
        'is_active',
    ];

    protected $casts = [
        'pass_mark' => 'decimal:2',
        'max_attempts' => 'integer',
        'is_active' => 'boolean',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /** Best score of a user on this quiz, or null when never attempted.
     *
     * Only attempts made after the latest certificate revocation count,
     * so a re-qualifying student is judged on their new attempts.
     */
    public function bestAttemptFor(int $userId): ?QuizAttempt
    {
        /** @var QuizAttempt|null $attempt */
        $attempt = $this->attempts()
            ->where('user_id', $userId)
            ->when($this->latestRevocationFor($userId), function ($query, $revokedAt) {
                $query->where('created_at', '>', $revokedAt);
            })
            ->orderByDesc('score')
            ->orderByDesc('id')
            ->first();

        return $attempt;
    }

    public function isPassedBy(int $userId): bool
    {
        $query = $this->attempts()
            ->where('user_id', $userId)
            ->where('passed', true)
            ->when($this->latestRevocationFor($userId), function ($query, $revokedAt) {
                $query->where('created_at', '>', $revokedAt);
            });

        return $query->exists();
    }

    /** Attempts of the user that count towards the attempt limit —
     * attempts made before a certificate revocation do not count, so a
     * revoked student gets a fresh budget.
     */
    public function attemptsCountFor(int $userId): int
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->when($this->latestRevocationFor($userId), function ($query, $revokedAt) {
                $query->where('created_at', '>', $revokedAt);
            })
            ->count();
    }

    /**
     * Timestamp of the latest certificate revocation for this user/course,
     * or null when there is none. Attempts older than it are ignored by the
     * pass/limit/best-score logic above.
     */
    protected function latestRevocationFor(int $userId)
    {
        return Certificate::query()
            ->where('user_id', $userId)
            ->where('course_id', $this->course_id)
            ->whereNotNull('revoked_at')
            ->orderByDesc('revoked_at')
            ->value('revoked_at');
    }

    /**
     * Resolve the effective pass mark: the quiz value when set by the admin,
     * otherwise the global default from settings.
     */
    public function effectivePassMark(): float
    {
        if ($this->pass_mark !== null && (float) $this->pass_mark > 0) {
            return (float) $this->pass_mark;
        }

        $settings = General_setting::query()->first();

        return (float) ($settings?->quiz_default_pass_mark ?? 70);
    }

    /**
     * Resolve the effective attempt limit; null means unlimited.
     */
    public function effectiveMaxAttempts(): ?int
    {
        return $this->max_attempts ?? null;
    }
}
