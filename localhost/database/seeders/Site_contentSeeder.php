<?php

namespace Database\Seeders;

use App\Models\Site_content;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class Site_contentSeeder extends Seeder
{
    /**
     * Homepage sections with the design defaults — the same texts the
     * storefront falls back to when a field is left empty.
     */
    public function run(): void
    {
        $data = [
            [
                'section' => 'hero',
                'title' => 'Learn the skills that',
                'highlight' => 'actually pay.',
                'badge' => 'New courses every week',
                'search_placeholder' => 'What do you want to learn?',
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'content' => 'Practical video courses from working professionals. Buy once, own forever — with certificates, quizzes and lifetime updates built in.',
                'visible' => true,
            ],
            [
                'section' => 'features_strip',
                'title' => null,
                'highlight' => null,
                'badge' => null,
                'search_placeholder' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'content' => null,
                'visible' => true,
            ],
            [
                'section' => 'popular',
                'title' => 'What students are taking this week',
                'content' => 'Hand-picked by enrollment velocity and completion rate — not by who paid for placement.',
                'badge' => 'Browse all courses',
                'highlight' => null,
                'search_placeholder' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            [
                'section' => 'latest_courses',
                'title' => 'Latest courses',
                'content' => 'Fresh releases from across the marketplace — updated as new courses pass review.',
                'badge' => 'View all',
                'highlight' => null,
                'search_placeholder' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            [
                'section' => 'blog',
                'title' => 'From the blog',
                'content' => 'Guides, deep dives and notes from the people teaching here — written to be useful after you close the tab.',
                'badge' => 'Read all posts',
                'highlight' => null,
                'search_placeholder' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            [
                'section' => 'instructors',
                'title' => 'Learn from people who do the work',
                'content' => 'Every instructor is vetted for real-world experience. They earn on every sale — so the best teachers keep teaching here.',
                'badge' => 'Meet all instructors',
                'highlight' => null,
                'search_placeholder' => null,
                'btn_text' => null,
                'btn_link' => null,
                'btn_text_2' => null,
                'btn_link_2' => null,
                'visible' => true,
            ],
            [
                'section' => 'call',
                'title' => 'Your next skill is one checkout away.',
                'content' => 'Card, PayPal, Mollie or Razorpay — pay how you want, get instant access, and start your first lesson in under a minute.',
                'badge' => 'Lifetime access · Certificates included · Secure checkout',
                'highlight' => null,
                'search_placeholder' => null,
                'btn_text' => 'Explore courses',
                'btn_link' => '/courses',
                'btn_text_2' => 'Become an instructor',
                'btn_link_2' => '/instructors',
                'visible' => true,
            ],
        ];

        Site_content::insert($data);
    }
}
