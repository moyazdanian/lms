# Codester screenshot set

Codester asks for a ZIP of **3–9 JPG or PNG screenshots**. Use 8–9 clean,
cropped images of the running product with realistic test data. Do not include
the desktop, browser chrome, bookmarks or unrelated tabs.

The gallery must show the real application, not the illustrated artwork from
`marketing/design/`. The preview image and icon are separate upload fields.

## Shot list

| # | Surface | Page / state | What must be visible |
|---|---|---|---|
| 1 | Storefront | Home page | Hero, popular courses and one other admin-managed section |
| 2 | Storefront | Course catalogue | Search, category/price filters, sorting and course cards |
| 3 | Storefront | Course detail | Title, price, instructor, curriculum and a free preview lesson |
| 4 | Storefront | Cart or checkout | Course in cart, coupon field and payment methods |
| 5 | Student | Dashboard | Enrolled courses and progress |
| 6 | Student | Lesson player | Video, lesson list, progress and attachments |
| 7 | Instructor | Dashboard or earnings | Sales chart, revenue and payout summary |
| 8 | Instructor | Course builder or curriculum | Seven-step flow or section/lesson editor |
| 9 | Admin | Filament dashboard or course approval | Revenue/order stats or approval review with real data |

## Useful routes

Use the storefront host for the first six shots and the API host for the admin
panel:

- `/` — home
- `/courses` — catalogue
- `/courses/{slug}` — course detail
- `/cart` — cart/checkout
- `/login` — sign-in (for the session cookies)
- `/dashboard` — student dashboard
- `/courses/{slug}/{sectionSlug}/{lessonSlug}` — lesson player
- `/dashboard/teaching` — instructor courses
- `/dashboard/earnings` — instructor earnings
- `/admin` — Filament panel
- `/admin/courses` or `/admin/course-approvals` — admin course screens

## Capture rules

- Use a **1440–1920 px** viewport and export each image at the same width.
- Crop to the product only; no OS window, browser toolbar or desktop.
- Use a realistic academy name, course names, instructor names, prices and
  cover images. Empty tables and "Test 1" data look unfinished.
- Do not show real customer emails, payment keys, SMTP passwords or API keys.
- Keep the site in a clean state: no debug bars, console overlays, cookie banner
  covering the main content (dismiss it before the shot), or unfinished courses.
- Save as PNG or high-quality JPG. Keep each file under about 1 MB if possible.
- ZIP the images directly (no nested folder); the command is in
  `marketing/codester/screenshots/README.md`.

## Current status

Nineteen captures are in `screenshots/`. The upload set is complete:
`screenshots.zip` contains nine 1366×900 product-only images covering the
storefront, checkout, student certificates, instructor dashboard and course
builder, and the admin dashboard. The Next.js dev badge and the admin scrollbar
were removed; the originals stay in the folder as alternates.

If you replace a capture, keep the ordered filename in `screenshots/final/` and
rerun `python scripts/build-codester-gallery.py`. The lesson player is kept as an
alternate because its video frame is light; a frame with a real lesson would be a
stronger shot if you want to swap it in.
