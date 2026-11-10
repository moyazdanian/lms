# LMS — Learning Management System

A complete, self-hosted learning platform: a Laravel admin API with a Filament
admin panel, and a Next.js storefront where students browse, buy and take
courses.

Ships as source code with Docker Compose for one-command deployment, and with a
tested manual installation path for servers without Docker.

---

## Contents

- [What you get](#what-you-get)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Requirements](#requirements)
- [Quick start with Docker](#quick-start-with-docker)
- [Manual installation](#manual-installation)
- [First sign-in](#first-sign-in)
- [Payments and webhooks](#payments-and-webhooks)
- [Documentation](#documentation)
- [Support and license](#support-and-license)

---

## What you get

**Storefront (Next.js)**

- Home page with hero slider, category and featured-course sections, top
  instructors, blog teasers and an admin-managed feature strip.
- Course catalogue with search, category filters, sorting and pagination.
- Course detail pages with an overview, curriculum, instructor profile and
  reviews, plus a preview video.
- Cart, coupons and checkout through the storefront with hosted payment pages.
- Student dashboard: enrolled courses, lesson player, progress tracking,
  quizzes and certificates.
- Instructor workspace: course builder (content, curriculum, pricing, review),
  sales and earnings, payout requests, public instructor profile.
- Blog index and article pages, driven by posts written in the admin panel.
- Dark/light theme, responsive layout and a cookie-consent banner.

**Admin panel (Filament)**

- Dashboard with revenue, enrolment and content metrics.
- Courses, sections, lessons, resources, quizzes and certificates.
- Course approval workflow with sensitive-field edit requests.
- Orders, payments, coupon usage, payout requests and instructor earnings.
- Users, instructors and instructor applications.
- Reviews, support tickets and notifications.
- Site settings: general, storage (local or S3-compatible), payment gateways,
  social login, payout methods, cookie consent, footer, legal pages and
  homepage content.
- Blog posts with draft/published state, cover image, author and per-post SEO
  fields.
- Legal pages (Terms, Privacy) and cookie-banner copy edited as rich text.

**Backend (Laravel)**

- Versioned REST API (`/api/v1`) consumed by the storefront.
- Token authentication (Sanctum) plus social login.
- Queued notifications and emails.
- Stripe, PayPal, Mollie and Razorpay integrations with a shared payment
  finalizer and idempotency, so webhook and redirect paths cannot double-credit
  an order.
- Feature test suite covering auth, checkout, approvals, media, certificates and
  legal pages.

---

## Tech stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Backend    | PHP 8.2+ (Docker image: 8.4), Laravel 12                       |
| Admin      | Filament 4                                                     |
| Database   | MySQL 8                                                         |
| Storefront | Next.js 15 (App Router, standalone output), React 19, Tailwind 4 |
| Payments   | Stripe, PayPal, Mollie, Razorpay                                |
| Deployment | Docker Compose: MySQL, php-fpm + nginx, queue worker, Next.js, Caddy (automatic HTTPS) |

---

## Project layout

```
.
├── docker-compose.yml        Production-style stack (MySQL, web, queue, frontend, Caddy)
├── .env.docker.example       Every variable the stack needs
├── docker/                   Caddyfile and shared container configuration
├── documentation/            Offline HTML handbook (open index.html)
├── localhost/                Laravel application + Filament admin panel
├── frontend/                 Next.js storefront
├── scripts/                  Repository tooling (release packaging)
└── CHANGELOG.md
```

`localhost/` is the Laravel application root — that naming is historical; it is
the backend, not a local-only folder.

---

## Requirements

**With Docker (recommended)**

- Docker Engine 24+ with the Compose plugin
- Two DNS records pointing at the server (storefront and API), or
  `WEB_DOMAIN=localhost` and `API_DOMAIN=api.localhost` for a local trial

**Manual installation**

- PHP 8.2+ with `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `gd`, `zip`,
  `intl` and `bcmath`
- Composer 2
- MySQL 8 (or MariaDB 10.6+)
- Node.js 18.18+ and npm
- A process supervisor for `php artisan queue:work` (or a systemd unit)

---

## Quick start with Docker

```bash
# 1. Create the environment file
cp .env.docker.example .env

# 2. Edit it — the five groups you must review
#    WEB_DOMAIN / API_DOMAIN        public hostnames
#    DB_DATABASE / DB_USERNAME / DB_PASSWORD / DB_ROOT_PASSWORD
#    ADMIN_EMAIL / ADMIN_PASSWORD   the first administrator account
#    MAIL_*                         a real mailbox for verification and resets
#    NEXT_PUBLIC_MEDIA_HOSTS        the host that serves uploaded images

# 3. Build and start
docker compose up -d

# 4. Watch the first boot (migrations, seeding, storage links)
docker compose logs -f web
```

Then open `https://<WEB_DOMAIN>` for the storefront and
`https://<API_DOMAIN>/admin` for the admin panel.

The first boot generates `APP_KEY`, waits for MySQL, runs migrations, seeds the
administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD` and links public storage.
Both admin values are required — the seeder fails instead of inventing a
password or shipping a default account.

Ports 80/443 are answered by Caddy, which obtains certificates automatically.
The storefront and API also listen on loopback-only ports `127.0.0.1:3000` and
`127.0.0.1:8080` for debugging on the server.

Full details, including putting the stack behind your own proxy, backups,
updates and troubleshooting: [documentation/docker.html](documentation/docker.html).

---

## Manual installation

### Backend

```bash
cd localhost
composer install
cp .env.example .env
php artisan key:generate
```

Create an empty MySQL database and a user that can write to it, then set the
`DB_*` block in `.env` (along with `APP_URL`, `FRONTEND_URL`, the session/cookie
domains and the `ADMIN_EMAIL` / `ADMIN_PASSWORD` pair).

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

In a second terminal, run the queue worker. Without it, verification emails,
payout notifications and other queued jobs stay in the `jobs` table:

```bash
php artisan queue:work
```

### Storefront

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_PROD_URL` must point at the backend, and
`NEXT_PUBLIC_MEDIA_HOSTS` at the host serving storage URLs. These values are
inlined at build time, so restart the dev server after editing them, and rebuild
after changing them in production.

Full details, environment reference and media/S3 setup:
[documentation/installation.html](documentation/installation.html).

---

## First sign-in

| Surface       | URL                | Account                                                    |
| ------------- | ------------------ | ---------------------------------------------------------- |
| Admin panel   | `/admin` (API host) | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your environment file |
| Storefront    | `/` (web host)      | Register normally, or use the same admin credentials       |

After signing in as the administrator, review **Settings** before going live:
general details, mailer, storage disk, payment gateways, social login, features,
footer links, legal pages and homepage content.

---

## Payments and webhooks

Gateway credentials are entered in the admin panel under **Settings → Payment
Gateways**; each gateway can be enabled independently.

Webhook endpoints (register them at the provider):

| Gateway  | Endpoint                              |
| -------- | ------------------------------------- |
| Stripe   | `https://<API_DOMAIN>/api/v1/webhooks/stripe`   |
| Mollie   | `https://<API_DOMAIN>/api/v1/webhooks/mollie`   |

Stripe needs its signing secret (`STRIPE_WEBHOOK_SECRET`) to accept webhook
calls. Checkout is also finalised on the return page, so a missed webhook does
not lose a payment, but the webhook is what confirms orders when a customer
closes the tab early. See
[localhost/docs/STRIPE_WEBHOOK_SETUP.md](localhost/docs/STRIPE_WEBHOOK_SETUP.md)
for the dashboard and Stripe CLI steps.

---

## Documentation

The handbook is static HTML — open it directly in a browser, no server needed:

| Page | Covers |
| --- | --- |
| [index.html](documentation/index.html) | Overview, feature map, what ships in the box |
| [installation.html](documentation/installation.html) | Manual install, environment reference, storage/S3, troubleshooting |
| [docker.html](documentation/docker.html) | Docker stack, domains and HTTPS, operations, backup/restore, updates |
| [deployment.html](documentation/deployment.html) | Deploying to a production server |
| [admin.html](documentation/admin.html) | Every admin panel screen, settings and content |
| [api.html](documentation/api.html) | REST API reference |
| [students.html](documentation/students.html) | Student-facing flows |
| [instructors.html](documentation/instructors.html) | Instructor workspace and approval workflow |

---

## Support and license

Commercial license — see [LICENSE.txt](LICENSE.txt) for the terms that apply to
this product and the list of third-party libraries it bundles. Redistribution,
resale or public release of the source, in whole or in part, is not permitted.

Support covers installation and defects in the delivered code. Customisation,
third-party service configuration and hosting are outside its scope.

Version history: [CHANGELOG.md](CHANGELOG.md).
