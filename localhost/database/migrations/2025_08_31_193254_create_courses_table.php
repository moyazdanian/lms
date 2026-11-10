<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('short_description', 160)->nullable();
            $table->string('slug');
            $table->string('thumbnail')->nullable();
            $table->text('description');
            $table->decimal('price' , 10 , 2);
            $table->decimal('discount_price' , 10 , 2)->nullable();
            $table->enum('status' , ['ongoing' , 'completed'])->default('ongoing');
            $table->enum('approval_status', ['draft', 'pending_approval', 'approved', 'rejected'])
                ->default('draft')
                ->index();
            $table->json('pending_changes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_for_approval_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->enum('level' , ['beginner' , 'intermediate' , 'advanced'])->default('intermediate');
            $table->string('language')->nullable();
            $table->json('requirements')->nullable();
            $table->json('objectives')->nullable();
            $table->json('tags')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('preview_video')->nullable();
            $table->string('media_disk')->nullable();
            $table->decimal('rating' , 5 , 2)->nullable();
            $table->boolean('is_active')->default(1);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
