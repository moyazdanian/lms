# Codester screenshot gallery

Codester accepts **3–9 JPG or PNG screenshots** in one ZIP. The ready upload
archive is [../screenshots.zip](../screenshots.zip); it contains the nine files
in [`final/`](final/) at the ZIP root.

| # | Upload image | Surface |
|---|---|---|
| 1 | `01-home-page.png` | Storefront home, hero and course cards |
| 2 | `02-course-catalogue.png` | Search, filters, sorting and course grid |
| 3 | `03-course-detail.png` | Course page, instructor, price and description |
| 4 | `04-checkout.png` | Cart summary, coupon and four payment methods |
| 5 | `05-student-certificates.png` | Student certificate wallet with verify and revocation |
| 6 | `06-instructor-dashboard.png` | Revenue, sales, students and payouts |
| 7 | `07-teaching-courses.png` | Instructor course management |
| 8 | `08-course-builder.png` | Seven-step course builder |
| 9 | `09-admin-dashboard.png` | Filament dashboard, orders and revenue |

The upload images are **1366×900 product-only crops**. The Next.js development
badge and the raw browser scrollbar in the admin capture were removed. The
full-page originals stay in this folder; they are not the upload set.

[`gallery-preview.jpg`](gallery-preview.jpg) is a contact sheet for reviewing
the order. Do not put it or this README in the ZIP.

## Rebuild

The gallery is reproducible from the full-page captures:

```bash
python scripts/build-codester-gallery.py
```

The script writes `final/`, rebuilds `../screenshots.zip` and refreshes
`gallery-preview.jpg`. It requires Pillow. The original captures are never
modified.

## Alternates

Ten captures are kept as alternates for a future gallery update:

- `shopping-cart.png` — cart without checkout;
- `lesson-player.png` — player with a light video frame;
- `instructor-dashboard-payout-request.png` — payout history;
- `admin-dashboard-course-approvals.png` — moderation queue;
- `admin-dashboard-courses.png` — course table;
- `admin-dashboard-enrollments.png` — enrollment table;
- `admin-dashboard-payment-gateways.png` — gateway settings;
- `admin-dashboard-payout-methods.png` — payout settings;
- `admin-dashboard-social-login.png` — social sign-in settings;
- `admin-dashboard-storage-settings.png` — storage settings.

The settings screens are useful for support docs but contain empty credential
fields, so they are weaker gallery shots. If you replace a final image, keep the
same `01-…` to `09-…` filename and rerun the build script so the ZIP stays
consistent.
