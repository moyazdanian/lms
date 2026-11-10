<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Section;
use App\Support\MediaDiskResolver;
use App\UploadFileTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    use UploadFileTrait;

    public function store(Request $request, Section $section)
    {
        $this->authorizeOwner($request, $section);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'video' => 'required|file|mimetypes:video/mp4,video/webm,video/quicktime|max:1024000',
            'duration' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
        ]);

        $isFree = filter_var($data['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // Validate video magic bytes: mp4, webm, quicktime
        $videoPath = $this->uploadFile(
            $request->file('video'),
            'lessons-videos',
            oldFile: null,
            disk: config('filesystems.lesson_video_disk', 'private'),
            allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime']
        );

        $lesson = $section->lessons()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'video_url' => $videoPath,
            'duration' => $data['duration'] ?? null,
            'sort_order' => $data['sort_order'] ?? (($section->lessons()->max('sort_order') ?? 0) + 1),
            'is_free' => $isFree,
            'preview' => $section->shouldPreviewFirstLesson(),
            'is_active' => 1,
        ]);

        return response()->json($this->presentLesson($lesson->fresh()), 201);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $this->authorizeOwner($request, $lesson->section);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/quicktime|max:1024000',
            'duration' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
        ]);

        $isFree = filter_var($data['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $payload = [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration' => $data['duration'] ?? null,
            'sort_order' => $data['sort_order'] ?? $lesson->sort_order,
            'is_free' => $isFree,
            'preview' => $isFree,
        ];

        if ($request->hasFile('video')) {
            // Validate video magic bytes: mp4, webm, quicktime
            $payload['video_url'] = $this->uploadFile(
                $request->file('video'),
                'lessons-videos',
                $lesson->video_url,
                config('filesystems.lesson_video_disk', 'private'),
                ['video/mp4', 'video/webm', 'video/quicktime']
            );
        }

        $lesson->update($payload);

        return response()->json($this->presentLesson($lesson->fresh()));
    }

    public function destroy(Request $request, Lesson $lesson)
    {
        $this->authorizeOwner($request, $lesson->section);

        if ($lesson->video_url) {
            Storage::disk(MediaDiskResolver::resolve($lesson, 'video_url'))->delete($lesson->video_url);
        }

        // Delete attachment rows explicitly so their files are removed too
        // (the DB cascade would leave orphaned files behind).
        $lesson->attachments()->get()->each->delete();

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted.']);
    }

    protected function authorizeOwner(Request $request, Section $section): void
    {
        $user = $request->user();

        abort_unless(
            (int) $section->course->instructor_id === (int) $user->id || $user->role === 'admin',
            403,
            'You do not own this course.'
        );
    }

    protected function presentLesson(Lesson $lesson): array
    {
        $data = $lesson->toArray();

        $data['video_url'] = $lesson->video_url
            ? route(
                ($lesson->is_free || $lesson->preview)
                    ? 'lessons.video.preview'
                    : 'lessons.video',
                ['lesson' => $lesson->id]
            )
            : null;

        return $data;
    }
}
