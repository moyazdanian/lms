<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonAttachmentDownloadController extends Controller
{
    public function index(Request $request, Lesson $lesson)
    {
        $this->authorizeViewer($request, $lesson);

        return response()->json([
            'data' => $lesson->attachments()
                ->get()
                ->map(fn (LessonAttachment $attachment) => [
                    'id' => $attachment->id,
                    'title' => $attachment->title,
                    'display_type' => $attachment->display_type,
                    'original_name' => $attachment->original_name,
                    'size_bytes' => $attachment->size_bytes,
                    'downloads_count' => $attachment->downloads_count,
                    'download_url' => route('lessons.attachments.download', [
                        'lesson' => $lesson->id,
                        'attachment' => $attachment->id,
                    ]),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function download(Request $request, Lesson $lesson, LessonAttachment $attachment)
    {
        abort_unless((int) $attachment->lesson_id === (int) $lesson->id, 404);

        $this->authorizeViewer($request, $lesson);

        // External links are not served from storage.
        abort_if($attachment->type === 'link' && ! $attachment->file_path, 404);

        $disk = Storage::disk($attachment->disk());

        abort_unless($attachment->file_path && $disk->exists($attachment->file_path), 404);

        $attachment->increment('downloads_count');

        $safeName = preg_replace('/[^\p{L}\p{N} _.\-]/u', '_', $attachment->original_name ?: 'attachment');

        // Stream instead of response()->download(): path() only exists on the
        // local driver, so streaming keeps the endpoint working identically on
        // S3-compatible storage (R2, Spaces, MinIO, ...).
        return response()->streamDownload(function () use ($disk, $attachment): void {
            $stream = $disk->readStream($attachment->file_path);

            if (! is_resource($stream)) {
                return;
            }

            while (! feof($stream)) {
                $chunk = fread($stream, 1024 * 1024);

                if ($chunk === false || $chunk === '') {
                    break;
                }

                echo $chunk;

                if (connection_aborted()) {
                    break;
                }

                flush();
            }

            fclose($stream);
        }, $safeName, [
            'Content-Type' => $attachment->mime_type ?: ($disk->mimeType($attachment->file_path) ?: 'application/octet-stream'),
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Same gate as LessonVideoController: enrolled buyers, the course
     * instructor, and admins. Free-preview lessons intentionally carry no
     * attachments, so there is no preview bypass here.
     */
    protected function authorizeViewer(Request $request, Lesson $lesson): void
    {
        $lesson->loadMissing('section.course');
        $course = $lesson->section?->course;
        $user = $request->user();

        abort_unless($course && $lesson->is_active, 404);

        $isInstructor = (int) $course->instructor_id === (int) $user->id;
        $isAdmin = $user->role === 'admin';
        $isEnrolled = $course->enrollments()
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        abort_unless($isInstructor || $isAdmin || $isEnrolled, 403);
    }
}
