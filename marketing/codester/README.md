# Codester submission — LMS

Everything needed for the **Codester** listing. This folder is not shipped in
the buyer ZIP; it is the author-side submission pack.

## What to upload

| Form field | File / value |
|---|---|
| Main file | `dist/codester/lms-1.0.0-codester.zip` |
| Preview image | `preview-1600x800.png` (preferred) or `preview-800x400.png` (official size) |
| Icon | `icon-400x400.png` (preferred) or `icon-200x200.png` (official size) |
| Screenshots | `screenshots.zip` — 9 images, ready; see [screenshots/README.md](screenshots/README.md) |
| Demo URL | Leave empty for now; see [Demo](#demo) |
| Video URL | Optional YouTube URL; not included yet |

Codester's own upload guide says 800×400 and 200×200; its rejection FAQ asks for
1600×800 and 200×200. Both sizes are provided so either reviewer expectation is
covered. The 1600×800 preview is a clean 2× render of the same design, not an
upscale. `icon-400x400.png` is the 2× version of the official 200×200 icon.

## Listing fields

### Name

```text
LMS - Laravel & Next.js Learning Management System
```

### Short description (123 characters)

```text
Self-hosted LMS with instructor marketplace, 4 payment gateways, quizzes, certificates and Docker. Laravel 12 + Next.js 15.
```

### Full description

Paste [DESCRIPTION.txt](DESCRIPTION.txt). It is plain text, so it survives the
Codester description editor without broken markup.

### Category and attributes

- **Category:** Scripts & Code → PHP Scripts → Management → School
- **Software framework:** Laravel 12, Next.js 15 (add React if the form has a
  separate field)
- **Programming language:** PHP 8.2+, JavaScript, TypeScript
- **Database:** MySQL 8
- **Software version:** 1.0.0
- **Filetypes included:** PHP, JavaScript, TypeScript, JSX/TSX, HTML, CSS,
  JSON, SQL, Markdown, YAML, Dockerfile, XML
- **Development time:** enter your real figure; use `600` only as a placeholder
  if you have not tracked the hours. This field does not change the price.

### Price

Suggested for this market:

```text
Regular:  $49
Extended: $147
```

Codester's convention for Extended is roughly 3× Regular; comparable LMS items
sit at $30–$64 Regular and $96–$165 Extended. Keep both markets close if you
also list on CodeCanyon.

### Tags

```text
lms, learning management system, online course platform, laravel, next.js, react, php, mysql, course marketplace, instructor marketplace, stripe, paypal, docker, self-hosted, certificate
```

Lowercase, comma-separated; 15 tags. Do not capitalize them in the form.

## Demo

No live demo is included in this release. Codester says a demo is not mandatory
for every item, but PHP scripts may be rejected without one, and a live demo is
the strongest conversion asset for an LMS. The upload form has a **Demo URL**
field; leaving it empty is the main review risk.

If you can publish a demo, use the same codebase and add:

- `demo.example.com` with a separate database and test storage;
- admin, instructor and student credentials in the description;
- realistic seeded courses, orders and reviews;
- test payment keys, a test SMTP mailbox and no real customer data;
- a nightly reset and a visible “Demo — data resets” banner;
- no purchase CTA or links to another marketplace;
- iframe-safe headers (Codester displays the demo in an iframe).

Do not submit the current test server as the public demo until it is reset,
seeded and hardened.

## Screenshots

`screenshots.zip` is built from the 19 captures in `screenshots/`. It contains
the nine product-only images in `screenshots/final/`, cropped to 1366×900 and
cleaned of the Next.js development badge. Codester accepts 3–9 images; the
alternate captures are kept for a future gallery update. The illustrated
marketing artwork is **not** a screenshot and is never included in this ZIP.

## Main ZIP

Build the Codester package from a clean commit with:

```bash
scripts/package-codester.sh
```

The script uses `git archive`, replaces the Envato `LICENSE.txt` with the
Codester license in this folder, renames the Laravel folder from `localhost/`
to `backend/`, updates every buyer-facing path, verifies that no secrets or
dependencies are included, and writes `dist/codester/lms-1.0.0-codester.zip`.
The local checkout keeps `localhost/`; the rename happens only inside the ZIP.

The ZIP contains:

```text
lms-1.0.0/
├── README.md
├── CHANGELOG.md
├── UPGRADING.md
├── LICENSE.txt              ← Codester Regular/Extended terms
├── docker-compose.yml
├── .env.docker.example
├── docker/
├── backend/                 ← Laravel 12 + Filament
├── frontend/                ← Next.js 15
└── documentation/           ← offline HTML handbook
```

The buyer downloads the full source; `vendor/`, `node_modules/`, `.next/`,
`.env`, storage uploads and the marketing folder are excluded. The Docker build
installs dependencies on the server.

## Upload walkthrough

1. Create an account at [codester.com](https://www.codester.com/) and open the
   seller area from the account menu. Complete the author profile first: avatar,
   cover, bio, country, tax/payment details and a support email.
2. Choose **Upload item** / **Submit your work**. Select
   **Scripts & Code → PHP Scripts → Management → School**.
3. Paste the listing copy from the sections above: name,
   [SHORT-DESCRIPTION.txt](SHORT-DESCRIPTION.txt), the full text from
   [DESCRIPTION.txt](DESCRIPTION.txt) and the 15 tags from [TAGS.txt](TAGS.txt).
4. Upload the main file:
   `dist/codester/lms-1.0.0-codester.zip`.
5. Upload the preview and icon. Start with `preview-1600x800.png` and
   `icon-400x400.png`; keep the 800×400 and 200×200 versions nearby in case the
   form enforces the older sizes. Never stretch an image to fit.
6. Upload [screenshots.zip](screenshots.zip). It already has the allowed nine
   images at the ZIP root; do not upload the `screenshots/` folder itself.
7. Set **Regular $49** and **Extended $147**. Enter your real development time
   if you tracked it; the placeholder does not affect the price.
8. Leave the demo URL empty only if you accept the review risk. For a PHP
   script, a reset-ready demo with admin/instructor/student credentials is the
   strongest approval and conversion asset. Never point the demo or listing to
   another marketplace.
9. State the support policy exactly as above: 12 months, two business days,
   no installation or customisation. Confirm you can meet it.
10. Submit and watch the account email. First review is normally 1–2 business
    days. If it is soft-rejected, fix the named issue and resubmit; a
    documentation omission means a full resubmission, so check the handbook
    before pressing Submit.

After approval, Codester pays 70% of each sale, monthly, through the payout
method in the author profile. Keep the demo reset script and the buyer ZIP
versioned; every code update needs a new main ZIP, a version bump and another
review.

## Before you press Submit

- [ ] The author profile is complete: avatar, cover image, bio and payment
      details. Codester's upload checklist requires a filled profile.
- [ ] `dist/codester/lms-1.0.0-codester.zip` was built from a clean commit and
      tested by unpacking into an empty directory.
- [ ] The ZIP contains `LICENSE.txt` with the Codester terms (no Envato text).
- [ ] `documentation/index.html` opens from the unpacked ZIP.
- [ ] The preview and icon are the actual files listed above; nothing is
      stretched.
- [x] `screenshots.zip` has 9 real, cropped screenshots with realistic data.
- [ ] The description, short description and tags above are pasted exactly.
- [ ] Price is set for both Regular and Extended.
- [ ] The demo URL is either a working, reset-ready demo or intentionally empty.
- [ ] No mention of CodeCanyon, Envato, another marketplace or an off-site
      purchase link appears in the listing or the demo.
- [ ] The support policy (12 months, 2 business-day response, no installation or
      customisation) is understood and you can meet it.
- [ ] You have time for the 1–2 business-day review and a possible soft-reject
      fix cycle.

## Review and updates

- New item review is normally **1–2 business days**.
- A documentation omission requires a full resubmission; do not submit without
  the handbook.
- Updates are uploaded as a new main ZIP and reviewed again. Keep
  `CHANGELOG.md` and `UPGRADING.md` current, bump the version and rebuild the
  package.
- A demo CTA pointing to another store is an explicit rejection reason. The demo
  and description must stay inside Codester's flow.

## Files in this folder

| File | Purpose |
|---|---|
| `preview-1600x800.png` | 2× preview for the rejection FAQ / retina listing |
| `preview-800x400.png` | Official preview size from the upload guide |
| `icon-400x400.png` | 2× icon |
| `icon-200x200.png` | Official icon size |
| `DESCRIPTION.txt` | Full listing description |
| `SHORT-DESCRIPTION.txt` | 123-character meta description |
| `TAGS.txt` | Lowercase tags |
| `LICENSE.txt` | Codester license injected into the ZIP |
| `SHOTLIST.md` | Screenshot plan and capture rules |
