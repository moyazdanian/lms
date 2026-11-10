<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function sectionDefaults(): array
    {
        return [
            'hero' => [
                'title' => 'Learn the skills that',
                'highlight' => 'actually pay.',
                'content' => 'Practical video courses from working professionals. Buy once, own forever — with certificates, quizzes and lifetime updates built in.',
                'badge' => 'New courses every week',
                'search_placeholder' => 'What do you want to learn?',
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            'features_strip' => [
                'title' => null,
                'highlight' => null,
                'content' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            'popular' => [
                'title' => 'What students are taking this week',
                'content' => 'Hand-picked by enrollment velocity and completion rate — not by who paid for placement.',
                'badge' => 'Browse all courses',
                'visible' => true,
            ],
            'latest_courses' => [
                'title' => 'Latest courses',
                'content' => 'Fresh releases from across the marketplace — updated as new courses pass review.',
                'badge' => 'View all',
                'visible' => true,
            ],
            'instructors' => [
                'title' => 'Learn from people who do the work',
                'content' => 'Every instructor is vetted for real-world experience. They earn on every sale — so the best teachers keep teaching here.',
                'badge' => 'Meet all instructors',
                'visible' => true,
            ],
            'call' => [
                'title' => 'Your next skill is one checkout away.',
                'content' => 'Card, PayPal, Mollie or Razorpay — pay how you want, get instant access, and start your first lesson in under a minute.',
                'highlight' => null,
                'badge' => 'Lifetime access · Certificates included · Secure checkout',
                'btn_text' => 'Explore courses',
                'btn_link' => '/courses',
                'btn_text_2' => 'Become an instructor',
                'btn_link_2' => '/instructors',
                'visible' => true,
            ],
        ];
    }
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('section');
            $table->string('title')->nullable();
            $table->string('highlight')->nullable();
            $table->string('badge')->nullable();
            $table->string('search_placeholder')->nullable();
            $table->boolean('visible')->default(true);
            $table->foreignId('hero_course_1_id')->nullable();
            $table->foreignId('hero_course_2_id')->nullable();
            $table->string('btn_text')->nullable();
            $table->string('btn_link')->nullable();
            $table->string('btn_text_2')->nullable();
            $table->string('btn_link_2')->nullable();
            $table->text('content')->nullable();
            $table->string('first_title')->nullable();
            $table->string('first_subtitle')->nullable();
            $table->string('first_icon')->nullable();
            $table->string('second_title')->nullable();
            $table->string('second_subtitle')->nullable();
            $table->string('second_icon')->nullable();
            $table->string('third_title')->nullable();
            $table->string('third_subtitle')->nullable();
            $table->string('third_icon')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
