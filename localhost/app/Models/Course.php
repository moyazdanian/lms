<?php

namespace App\Models;

use App\Support\MediaDiskResolver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Course extends Model
{
    use SoftDeletes;

    /**
     * Approval workflow statuses.
     */
    public const APPROVAL_DRAFT = 'draft';
    public const APPROVAL_PENDING = 'pending_approval';
    public const APPROVAL_APPROVED = 'approved';
    public const APPROVAL_REJECTED = 'rejected';

    /**
     * Changing any of these fields on an approved course requires admin
     * re-approval before they go live. Everything else saves directly.
     */
    public const SENSITIVE_FIELDS = [
        'title',
        'price',
        'discount_price',
        'level',
        'language',
        'category_id',
        'thumbnail',
        'preview_video',
    ];

    protected $fillable = [
        'approval_status',
        'rejection_reason',
        'submitted_for_approval_at',
        'reviewed_by',
        'approved_at',
        'category_id',
        'instructor_id',
        'title',
        'slug',
        'thumbnail',
        'preview_video',
        'media_disk',
        'description',
        'short_description',
        'price',
        'discount_price',
        'status',
        'level',
        'language',
        'requirements',
        'objectives',
        'tags',
        'currency',
        'rating',
        'is_active',
    ];

    protected $casts = [
        'approval_status' => 'string',
        'submitted_for_approval_at' => 'datetime',
        'approved_at' => 'datetime',
        'requirements' => 'array',
        'objectives' => 'array',
        'tags' => 'array',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::created(function (Course $course): void {
            // Remember which disk the preview video was uploaded to.
            if ($course->preview_video) {
                MediaDiskResolver::stamp($course, 'preview_video', MediaDiskResolver::currentDisk());
            }
        });

        static::updated(function (Course $course): void {
            // After save (not during): the preview video was replaced by a
            // new upload on the current disk — remember it.
            if ($course->wasChanged('preview_video') && $course->preview_video) {
                MediaDiskResolver::stamp($course, 'preview_video', MediaDiskResolver::currentDisk());
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class , 'instructor_id' , 'id');
    }
    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->where('parent_id' , null)->latest();
    }

    /**
     * Courses visible to the general public: approved by admin, active,
     * and not owned by a rejected instructor.
     */
    public function scopePublicVisible($query)
    {
        return $query
            ->where('approval_status', self::APPROVAL_APPROVED)
            ->where('is_active', 1)
            ->whereHas('instructor', function ($q) {
                $q->whereDoesntHave('instructor', function ($p) {
                    $p->where('status', 'rejected');
                });
            });
    }

    /**
     * Human-readable label of a sensitive field, used in approval diffs.
     */
    public static function sensitiveFieldLabels(): array
    {
        return [
            'title' => 'Title',
            'price' => 'Price',
            'discount_price' => 'Discount price',
            'level' => 'Level',
            'language' => 'Language',
            'category_id' => 'Category',
            'thumbnail' => 'Thumbnail',
            'preview_video' => 'Preview video',
        ];
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Sensitive-field edit requests of a live course. A pending request keeps
     * the course approved; rejecting one never unpublishes the course.
     */
    public function editRequests()
    {
        return $this->hasMany(CourseEditRequest::class)->latest('id');
    }

    public function pendingEditRequest()
    {
        return $this->hasOne(CourseEditRequest::class)
            ->where('status', CourseEditRequest::STATUS_PENDING)
            ->latestOfMany('id');
    }

    public function lastRejectedEditRequest()
    {
        return $this->hasOne(CourseEditRequest::class)
            ->where('status', CourseEditRequest::STATUS_REJECTED)
            ->latestOfMany('id');
    }

    public function instructorEarnings()
    {
        return $this->hasManyThrough(
            InstructorEarning::class,
            OrderItem::class,
            'course_id',      // order_items.course_id
            'order_item_id',  // instructor_earnings.order_item_id
            'id',             // courses.id
            'id'              // order_items.id
        );
    }

}
