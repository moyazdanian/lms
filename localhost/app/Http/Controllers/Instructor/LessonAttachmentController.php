<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\UploadFileTrait;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LessonAttachmentController extends Controller
{
    use UploadFileTrait;

    public function index(Request $request, Lesson $lesson)
    {
        $this->authorizeOwner($request, $lesson);

        return response()->json([
            'data' => $lesson->attachments()
                ->get()
                ->map(fn (LessonAttachment $attachment) => $this->present($attachment))
                ->values()
                ->all(),
        ]);
    }

    public function store(Request $request, Lesson $lesson)
    {
        $this->authorizeOwner($request, $lesson);

        $maxSize = (int) config('lessons.attachment_max_size');
        $maxCount = (int) config('lessons.attachment_max_count');
        $mimetypes = config('lessons.attachment_mimetypes');

        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'file' => [
                'required',
                'file',
                'max:' . $maxSize,
                'mimetypes:' . implode(',', $mimetypes),
            ],
        ]);

        $file = $request->file('file');

        // The mimetypes rule catches bad extensions; this blocks an office or
        // PDF file whose bytes were swapped with something else entirely.
        abort_unless(
            $this->validateAttachmentSignature($file),
            422,
            'The file content does not match its extension.'
        );

        if ($lesson->attachments()->count() >= $maxCount) {
            return response()->json([
                'message' => "A lesson can hold at most {$maxCount} attachments.",
            ], 422);
        }

        $path = $file->storeAs(
            'lesson-attachments',
            Str::uuid() . '.' . strtolower($file->getClientOriginalExtension()),
            config('lessons.attachment_disk')
        );

        $attachment = $lesson->attachments()->create([
            'title' => $data['title'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'type' => $this->resolveType($file),
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'sort_order' => ($lesson->attachments()->max('sort_order') ?? 0) + 1,
        ]);

        return response()->json(['data' => $this->present($attachment)], 201);
    }

    public function update(Request $request, LessonAttachment $attachment)
    {
        $this->authorizeAttachment($request, $attachment);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $attachment->update([
            'title' => $data['title'],
            'sort_order' => $data['sort_order'] ?? $attachment->sort_order,
        ]);

        return response()->json(['data' => $this->present($attachment->fresh())]);
    }

    public function destroy(Request $request, LessonAttachment $attachment)
    {
        $this->authorizeAttachment($request, $attachment);

        $attachment->delete(); // model hook removes the file from disk

        return response()->json(['message' => 'Attachment deleted.']);
    }

    protected function authorizeOwner(Request $request, Lesson $lesson): void
    {
        $user = $request->user();
        $course = $lesson->section?->course;

        abort_unless($course, 404);

        abort_unless(
            (int) $course->instructor_id === (int) $user->id || $user->role === 'admin',
            403,
            'You do not own this course.'
        );
    }

    protected function authorizeAttachment(Request $request, LessonAttachment $attachment): void
    {
        $this->authorizeOwner($request, $attachment->lesson()->with('section.course')->firstOrFail());
    }

    /**
     * Signature check for the document/zip set. ZIP bytes also cover docx,
     * xlsx, pptx because they are ZIP containers internally.
     */
    protected function validateAttachmentSignature(UploadedFile $file): bool
    {
        $mime = strtolower((string) $file->getMimeType());
        $handle = $file->openFile('rb');
        $header = strtoupper(bin2hex($handle->fread(8) ?: ''));

        return match (true) {
            str_starts_with($header, '25504446') => str_starts_with($mime, 'application/pdf'), // %PDF
            str_starts_with($header, '504B0304') => str_contains($mime, 'zip')
                || str_contains($mime, 'officedocument'), // PK.. = zip/docx/xlsx/pptx
            str_starts_with($header, 'D0CF11E0') => str_contains($mime, 'msword')
                || str_contains($mime, 'ms-excel')
                || str_contains($mime, 'ms-powerpoint'), // legacy OLE office
            str_starts_with($header, '1F8B') => str_contains($mime, 'zip'), // gzip uploaded as zip
            str_starts_with($header, 'EFBBBF') || str_starts_with($header, 'FEFF') || str_starts_with($header, '0000FEFF') => true, // text/BOM
            default => $file->getClientOriginalExtension() === 'txt'
                || $file->getClientOriginalExtension() === 'md',
        };
    }

    protected function resolveType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $types = config('lessons.attachment_types');

        return $types[$extension][1] ?? 'file';
    }

    protected function present(LessonAttachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'lesson_id' => $attachment->lesson_id,
            'title' => $attachment->title,
            'display_type' => $attachment->display_type,
            'original_name' => $attachment->original_name,
            'size_bytes' => $attachment->size_bytes,
            'downloads_count' => $attachment->downloads_count,
            'sort_order' => $attachment->sort_order,
        ];
    }
}
