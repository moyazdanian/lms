<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sensitive-field edits on LIVE courses get their own review table so the
     * course itself keeps its approved status (and stays sellable) while a
     * change request is pending. approval_status on courses is now only the
     * lifecycle of the course as a whole (new submissions).
     */
    public function up(): void
    {
        Schema::create('course_edit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('changes');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_at')->nullable()->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        // Move queued edit changes of already-approved courses into the new
        // table and restore the course to its approved state.
        $courses = DB::table('courses')
            ->whereNotNull('pending_changes')
            ->get(['id', 'instructor_id', 'pending_changes', 'submitted_for_approval_at', 'approved_at']);

        foreach ($courses as $course) {
            $changes = json_decode((string) $course->pending_changes, true);

            if (is_array($changes) && $changes !== []) {
                DB::table('course_edit_requests')->insert([
                    'course_id' => $course->id,
                    'instructor_id' => $course->instructor_id,
                    'changes' => json_encode($changes),
                    'status' => 'pending',
                    'submitted_at' => $course->submitted_for_approval_at ?? now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('courses')
                ->where('id', $course->id)
                ->update([
                    'approval_status' => $course->approved_at ? 'approved' : 'pending_approval',
                    'pending_changes' => null,
                ]);
        }

        // Repair data created by the previous buggy behavior: a live course
        // whose edit request was rejected must stay visible.
        DB::table('courses')
            ->where('approval_status', 'rejected')
            ->whereNotNull('approved_at')
            ->update([
                'approval_status' => 'approved',
                'rejection_reason' => null,
            ]);

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('pending_changes');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->json('pending_changes')->nullable()->after('approval_status');
        });

        // Best-effort rollback: re-queue still-pending edit requests.
        $requests = DB::table('course_edit_requests')->where('status', 'pending')->get();

        foreach ($requests as $request) {
            DB::table('courses')
                ->where('id', $request->course_id)
                ->update([
                    'approval_status' => 'pending_approval',
                    'pending_changes' => $request->changes,
                    'submitted_for_approval_at' => $request->submitted_at,
                ]);
        }

        Schema::dropIfExists('course_edit_requests');
    }
};
