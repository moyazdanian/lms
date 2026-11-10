<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Section;
use App\Support\MediaDiskResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SectionController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $this->authorizeOwner($request, $course);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $section = $course->sections()->create([
            'title' => $data['title'],
            'sort_order' => $data['sort_order'] ?? (($course->sections()->max('sort_order') ?? 0) + 1),
        ]);

        return response()->json($section->fresh(), 201);
    }

    public function update(Request $request, Section $section)
    {
        $this->authorizeOwner($request, $section->course);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $section->update([
            'title' => $data['title'],
            'sort_order' => $data['sort_order'] ?? $section->sort_order,
        ]);

        return response()->json($section->fresh());
    }

    public function destroy(Request $request, Section $section)
    {
        $this->authorizeOwner($request, $section->course);

        foreach ($section->lessons as $lesson) {
            if ($lesson->video_url) {
                Storage::disk(MediaDiskResolver::resolve($lesson, 'video_url'))->delete($lesson->video_url);
            }

            $lesson->attachments()->get()->each->delete();
        }

        $section->delete();

        return response()->json(['message' => 'Section deleted.']);
    }

    protected function authorizeOwner(Request $request, Course $course): void
    {
        $user = $request->user();

        abort_unless(
            (int) $course->instructor_id === (int) $user->id || $user->role === 'admin',
            403,
            'You do not own this course.'
        );
    }
}
