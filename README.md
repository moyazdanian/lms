# LMS — Learning Management System

A complete, self-hosted learning platform: a Laravel admin API with a Filament
admin panel, and a Next.js storefront where students browse, buy and take
courses.

Ships as source code for Docker Compose and is deployed on a Linux server with
one command. Docker is the only supported installation path; the handbook
covers it end to end.

---

## Contents

- [What you get](#what-you-get)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [First sign-in](#first-sign-in)
- [Payments and webhooks](#payments-and-webhooks)
- [Documentation](#documentation)
- [Updating](#updating)
- [Support and license](#support-and-license)

---

## What you get

**Storefront (Next.js)**

- Home page assembled from admin-managed sections: hero, features strip,
  popular and latest courses, instructors, blog and closing call to action.
- Course catalogue with search, category filters, price filters, sorting and
  pagination.
- Course detail pages with an overview (including the instructor profile), a
  curriculum with free previews, and reviews, plus a preview video.
- Cart, coupons and checkout with Stripe, PayPal, Mollie or Razorpay.
- Student dashboard: enrolled courses, lesson player with progress tracking,
  quizzes, certificates, wishlist, payments, notifications and support tickets.
- Instructor workspace: seven-step course builder, curriculum and quiz editors,
  sales and earnings charts, payout requests, and a public instructor profile.
- Blog index and article pages, driven by posts written in the admin panel.
- Dark/light theme, responsive layout and a cookie-consent banner.

**Admin panel (Filament)**

- Dashboard with revenue, orders, instructors, pending payouts and pending
  applications.
- Categories, courses with a curriculum (sections and lessons), course approvals
  and sensitive-field edit requests, and enrollments.
- Users, instructors with their teaching profiles, and instructor applications.
- Orders, gateway payments, payout requests, coupons and coupon usages.
- Certificates and quizzes, including the pass mark and attempt limit that only
  an administrator controls.
- Homepage content, footer, terms and privacy, cookie consent and blog posts.
- Support tickets and in-app notifications for one user or everyone.
- Settings: general, payment gateways, payout methods, Google sign-in, storage
  (local or S3-compatible) with a connection test, and a storage report.

**Backend (Laravel)**

- Versioned REST API (`/api/v1`) consumed by the storefront.
- Sanctum session authentication plus Google sign-in.
- Queued notifications and transactional email through SMTP.
- Stripe, PayPal, Mollie and Razorpay integrations with a shared payment
  finalizer and idempotency, so webhook and redirect paths cannot double-credit
  an order.
- Private lesson media with enrollment checks, and PDF certificates with public
  verification.
- Feature test suite covering auth, checkout, approvals, payouts, media,
  certificates and legal pages.

---

## Tech stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Backend    | PHP 8.2+ (Docker image: 8.4), Laravel 12                       |
| Admin      | Filament 4                                                     |
| Database   | MySQL 8 (the Docker stack pins 8.4.11)                         |
| Storefront | Next.js 15 (App Router, standalone output), React 19, Tailwind 4 |
| Payments   | Stripe, PayPal, Mollie, Razorpay                                |
| Deployment | Docker Compose: MySQL, php-fpm + nginx + queue worker, Next.js, Caddy (automatic HTTPS) |

---

## Project layout

```
.
├── docker-compose.yml        The four-service production stack
├── .env.docker.example       Every variable the stack needs
├── docker/                   Caddyfile and container configuration
├── documentation/            Offline HTML handbook (open index.html)
├── localhost/                Laravel application + Filament admin panel
├── frontend/                 Next.js storefront
├── CHANGELOG.md              Version history
└── UPGRADING.md              Update and rollback guide
```

`localhost/` is the Laravel application root — that naming is historical; it is
the backend, not a local-only folder.

---

## Requirements

- A Linux server (Ubuntu 22.04 or 24.04 LTS recommended) with Docker Engine 24+
  and the Compose v2 plugin.
- Two DNS records pointing at the server: the storefront host and the API host.
  Ports 80 and 443 must be reachable through any firewall.
- At least 2 vCPU, 2 GB RAM and 40 GB disk. Lesson videos are the main storage
  cost; an S3-compatible bucket can be used instead.
- An SMTP account for verification, password resets and decision emails.

Nothing else is installed on the host: no PHP, Node, Composer, MySQL, nginx or
certificate tooling.

---

## Quick start

```bash
# 1. Create the environment file next to docker-compose.yml
cp .env.docker.example .env

# 2. Fill in the values you must not leave at the defaults
#    WEB_DOMAIN / API_DOMAIN          bare hostnames, no scheme
#    DB_DATABASE / DB_USERNAME / DB_PASSWORD / DB_ROOT_PASSWORD
#    ADMIN_EMAIL / ADMIN_PASSWORD     the first administrator account
#    MAIL_*                           a real mailbox for verification and resets

# 3. Build and start
docker compose up -d

# 4. Watch the first boot (migrations, seeding, storage links)
docker compose logs -f api caddy
```

Then open `https://<WEB_DOMAIN>` for the storefront and
`https://<API_DOMAIN>/admin` for the admin panel.

The first boot generates `APP_KEY`, waits for MySQL, runs migrations, seeds the
starting content and the administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD`,
and links public storage. Both admin values are required — the stack refuses to
start instead of inventing a password or shipping a default account. Seeding
runs only once; later restarts migrate without overwriting your content.

Caddy answers ports 80/443, obtains and renews certificates for both hostnames,
and keeps the application containers on loopback-only ports
(`127.0.0.1:3000` and `127.0.0.1:8080`) for debugging on the server.

The full procedure — DNS, the complete environment reference, SMTP provider
values, HTTPS, backups, updates and troubleshooting — is in
[documentation/installation.html](documentation/installation.html).

---

## First sign-in

| Surface       | URL                            | Account                                                     |
| ------------- | ------------------------------ | ----------------------------------------------------------- |
| Admin panel   | `/admin` on the API host        | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment file   |
| Storefront    | `/` on the web host             | Register normally, or sign in with the same admin account    |

Before going live, review the settings in the panel: general details and logo,
payment gateways, payout methods, Google sign-in, storage, banner and legal
text, footer and homepage content. SMTP is configured separately in `.env`,
as described in the installation guide. What each screen does is documented
in [documentation/admin.html](documentation/admin.html).

---

## Payments and webhooks

Gateway credentials are entered in the admin panel under **Settings → Payment
Gateways** and stored in the database. Each gateway can be enabled
independently; Stripe is offered at checkout as soon as its secret key is saved.

Stripe also needs a webhook so orders complete when a customer closes the tab
before returning:

1. In the Stripe Dashboard, add an endpoint at
   `https://<API_DOMAIN>/api/v1/webhooks/stripe`.
2. Subscribe it to `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed` and `checkout.session.expired`.
3. Copy the endpoint's signing secret into **Settings → Payment Gateways →
   Stripe Webhook Signing Secret**.

PayPal, Mollie and Razorpay are verified when the browser returns to the success
page; an administrator can settle a missed payment with **Payments → Resync**.
The step-by-step setup for every gateway, including where to obtain the keys, is
in [documentation/admin.html#settings](documentation/admin.html#settings).
Stripe-specific notes are in
[localhost/docs/STRIPE_WEBHOOK_SETUP.md](localhost/docs/STRIPE_WEBHOOK_SETUP.md).

---

## Documentation

The handbook is static HTML — open it directly in a browser, no server needed:

| Page | Covers |
| --- | --- |
| [index.html](documentation/index.html) | Product overview, technology stack, architecture, role map and feature map |
| [installation.html](documentation/installation.html) | Docker deployment, DNS, every `.env` key, SMTP, first boot, HTTPS, backups, updates and troubleshooting |
| [students.html](documentation/students.html) | Every storefront page, catalog, checkout, classroom, quizzes, certificates, account and privacy |
| [instructors.html](documentation/instructors.html) | Applying to teach, the dashboard, course creation and editing, approvals, earnings and payouts |
| [admin.html](documentation/admin.html) | Every admin-panel screen, content editing, and complete setup for gateways, Google sign-in and S3 storage |
| [api.html](documentation/api.html) | REST API conventions, endpoints, webhooks and data model |

---

## Updating

Every release is a complete package; download the new version from the
marketplace account that purchased it. Back up the database, `.env` and local
storage first, then follow [UPGRADING.md](UPGRADING.md). Migrations run when the
API container boots. Do not unpack an update over a running installation, and
keep the previous directory and database dump until the new version is verified.

---

## Support and license

Commercial license — see [LICENSE.txt](LICENSE.txt) for the terms that apply to
this product. Reselling or redistributing the source as-is is not permitted;
the license from the marketplace where you purchased the item governs.

Support covers defects in the delivered code and questions about the documented
features. Installation, server configuration, third-party service setup and customisation are outside its scope.

Version history: [CHANGELOG.md](CHANGELOG.md).
