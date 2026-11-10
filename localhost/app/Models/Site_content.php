<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Site_content extends Model
{
    protected $fillable = [
        'section',
        'title',
        'highlight',
        'badge',
        'search_placeholder',
        'btn_text',
        'btn_link',
        'btn_text_2',
        'btn_link_2',
        'content',
        'visible',
        'hero_course_1_id',
        'hero_course_2_id',
        // Features strip — one row (section = 'features_strip') holds the
        // three strip items (title/subtitle/icon) previously in `features`.
        'first_title',
        'first_subtitle',
        'first_icon',
        'second_title',
        'second_subtitle',
        'second_icon',
        'third_title',
        'third_subtitle',
        'third_icon',
    ];

    protected $casts = [
        'visible' => 'boolean',
    ];

    /**
     * The two courses shown as floating cards in the hero collage.
     * Empty selections let the frontend fall back to popular courses.
     */
    public function heroCourse1()
    {
        return $this->belongsTo(Course::class, 'hero_course_1_id');
    }

    public function heroCourse2()
    {
        return $this->belongsTo(Course::class, 'hero_course_2_id');
    }

    /**
     * The three-item features strip lives on the features_strip row.
     * Merged from the old standalone `features` table.
     */
    public function getFeaturesAttribute(): array
    {
        return [
            ['icon' => $this->first_icon, 'title' => $this->first_title, 'subtitle' => $this->first_subtitle],
            ['icon' => $this->second_icon, 'title' => $this->second_title, 'subtitle' => $this->second_subtitle],
            ['icon' => $this->third_icon, 'title' => $this->third_title, 'subtitle' => $this->third_subtitle],
        ];
    }
}
