<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Section extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'sort_order',
        'slug'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    protected static function booted()
    {
        static::created(function ($section) {
            if (!$section->slug) {
                $section->update([
                    'slug' => Str::slug($section->title) . '-s' . $section->id,
                ]);
            }
        });
    }

    public function shouldPreviewFirstLesson(): bool
{
    $firstSection = $this->course
        ->sections()
        ->orderBy('sort_order')
        ->first();

    return $firstSection?->is($this)
        && ! $this->lessons()->exists();
}
}
