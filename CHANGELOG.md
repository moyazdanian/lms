# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No unreleased changes yet.

## [1.0.0] — 2026-11-10

First public release.

### Added

- **Storefront (Next.js 15)**
  - Home page with hero slider, category and featured course sections, top
    instructors, blog teasers and an admin-managed feature strip.
  - Course catalogue with search, category filters, sorting and pagination.
  - Course detail pages: overview, curriculum, instructor profile, reviews,
    preview video and related courses.
  - Cart, coupon codes and checkout with hosted payment pages.
  - Student dashboard: enrolled courses, lesson player, progress tracking,
    quizzes and certificate downloads.
  - Instructor workspace: course builder with draft/save/resume, curriculum
    editor, pricing and review step, sales, earnings and payout requests.
  - Instructor directory and public instructor profiles.
  - Blog index and article pages rendered from admin-authored posts.
  - Cookie consent banner, dark/light theme and responsive layout.
  - Legal pages (Terms of Service, Privacy Policy) rendered from the admin
    panel's rich-text editor.

- **Admin panel (Filament 4)**
  - Dashboard with revenue, enrolment and content metrics.
  - Courses with an approval workflow, rejection reasons and sensitive-field
    edit requests that require re-approval.
  - Sections, lessons, lesson resources, quizzes and certificates.
  - Orders, payments, coupon usage, enrollments and payout requests.
  - Users, instructors, instructor applications and earnings.
  - Reviews, support tickets and admin notifications.
  - Blog posts with draft/published state, cover image, author and per-post SEO
    fields.
  - Site content management: homepage sections and visibility toggles, footer
    links, legal pages and cookie-banner copy.
  - Settings: general, storage (local or S3-compatible) with a connection test
    and storage report, payment gateways, social login and payout methods.

- **Backend (Laravel 12)**
  - Versioned REST API under `/api/v1` consumed by the storefront.
  - Sanctum token authentication and social login.
  - Stripe, PayPal, Mollie and Razorpay integrations sharing one payment
    finalizer with idempotent order finalisation for webhook and redirect paths.
  - Queued notifications and transactional email.
  - Feature test suite covering authentication, checkout, course approval, media
    delivery, certificates and legal pages.

- **Deployment**
  - Docker Compose stack: MySQL 8, php-fpm with nginx, queue worker, Next.js
    standalone server and Caddy with automatic HTTPS.
  - First-boot automation: application key generation, database readiness wait,
    migrations, one-time seeding, storage links and admin account creation.
  - Offline HTML documentation covering installation, Docker deployment, server
    deployment, the admin panel, the API and both end-user journeys.

### Security

- Admin panel access restricted to the `admin` role.
- Payment finalisation guarded against duplicate webhook deliveries.
- Private lesson videos served through authenticated API endpoints and a
  private storage disk, rather than public file URLs.
- No default administrator account ships with the code; `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` are required at install time.

[Unreleased]: https://github.com/moyazdanian/lms/compare/1.0.0...HEAD
[1.0.0]: https://github.com/moyazdanian/lms/releases/tag/1.0.0
