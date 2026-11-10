        c# نقشه راه v1 و انتشار در CodeCanyon

> این سند فقط **کارهای فنی** باقی‌مانده تا رسیدن به نسخه ۱ و انتشار در CodeCanyon را جمع‌بندی می‌کند.
> هیچ فیچر جدیدی در آن پیشنهاد نشده؛ فقط پایداری، امنیت، مستندات، بسته‌بندی و تجربه نصب.

تاریخ بررسی: ۹ نوامبر ۲۰۲۶ — بر اساس وضعیت فعلی مخزن (Laravel 12 / Filament 4 + Next.js 15.3.3).

---

## ۱. خلاصه اجرایی

محصول از نظر **دامنه و قابلیت** برای v1 کامل است: LMS با دوره، فصل/درس، ثبت‌نام، پرداخت چنددرگاهی، کوپن، کیف پول مدرس/درخواست تسویه، آزمون، گواهی، نظرات، تیکت پشتیبانی، GDPR، تنظیمات کامل ادمین و از این نسخه بلاگ + محتوای صفحه اصلی.

شکاف‌های باقی‌مانده عمدتاً **«محصول‌سازی»** است، نه فیچر:

| حوزه | وضعیت | شدت |
|---|---|---|
| کنترل نسخه (Git) | ❌ هیچ مخزن گیتی وجود ندارد | **بلاکر** |
| بسته‌بندی و فایل‌های حساس در ZIP | ❌ `.env`، `.tmp-db-migrate`، پوشه خراب `frontend;C` | **بلاکر** |
| وابستگی‌های آسیب‌پذیر | ❌ ۵۳ مورد (۲ critical، ۱۴ high) | **بلاکر** |
| وبهوک Stripe روی نصب Docker | ⚠️ secret به کانتینر پاس نمی‌شود | **بلاکر** |
| مستندات | ⚠️ بلاگ و «Homepage Content» مستند نیست، changelog/license ندارد | **بلاکر** |
| SEO فروشگاه | ❌ بدون sitemap/robots/canonical و صفحات ۴۰۴/۵۰۰ | مهم |
| تست خودکار و CI | ⚠️ ۳۰ فایل تست بدون CI | مهم |
| تجربه اولین نصب (دمو) | ⚠️ فروشگاه بعد از نصب خالی است | مهم |
| کیفیت کد | ✅ lint پاس، چند مورد جزئی | کم |

**تخمین کل: ۹ تا ۱۴ روز کاری** (با احتساب تست نصب مجدد روی سرور تازه).

---

## ۲. آنچه آماده و تأیید شده است

این‌ها را در v1 دست نزنید؛ فقط مستند شود:

- **بک‌اند:** Laravel 12، ۳۷ migration، ۴۸ کنترلر، ۸۶ روت API، ۹ Notification صف‌شده.
- **پنل ادمین:** Filament 4، ۲۰ Resource + صفحات Settings/Content؛ دسترسی فقط `role === 'admin'`.
- **فروشگاه:** Next.js 15.3.3 (standalone)، Tailwind 4، `npm run lint` = بدون خطا/هشدار.
- **Docker:** MySQL 8.4.11، php-fpm + nginx + queue worker (supervisord)، Next standalone، Caddy با TLS خودکار.
- **پرداخت:** Stripe / PayPal / Mollie / Razorpay (کلیدها در پنل)، مسیر free checkout، idempotency، `PaymentFinalizer` مشترک وب‌هوک و verify.
- **بلاگ (تازه):** migration، مدل + Policy (آماده برای مدرس در آینده: `AUTHOR_ROLES`)، Resource ادمین، `/api/v1/blog-posts`، صفحات `/blog` و `/blog/[slug]`، بخش صفحه اصلی + تاگل در «Homepage Content»، لینک در هدر.
- **مستندات:** ۸ صفحه HTML (index، installation، docker، deployment، admin، api، students، instructors).
- **تست:** ۳۰ فایل تست Feature (Auth، پرداخت، تأیید دوره، مدیا، گواهی، قانونی).

---

## ۳. کارهای باقی‌مانده

### ۳.۱ — P0: بلاکرهای انتشار

#### الف) کنترل نسخه و مخزن تمیز

- `git init` در ریشه پروژه + اولین کامیت (در حال حاضر هیچ `.git` ای وجود ندارد؛ ریسک از دست رفتن کار و نبود امکان changelog).
- افزودن `.gitignore` در **ریشه** (الان فقط `localhost` و `frontend` گیت‌ایگنور دارند و اصلاً گیتی نیست):

```
# secrets
.env
localhost/.env
frontend/.env
frontend/.env.local

# dependencies / build
localhost/vendor
frontend/node_modules
frontend/.next

# storage
localhost/storage/app/*
!localhost/storage/app/.gitignore
localhost/storage/logs/*
localhost/storage/framework/cache/data/*
localhost/storage/framework/sessions/*
localhost/storage/framework/views/*
localhost/public/storage

# dev junk
.freebuff
.tmp-db-migrate*
frontend;C
*.log
```

- حذف از درخت پروژه: `.tmp-db-migrate/`، `.tmp-db-migrate;M/`، `frontend;C/` (پوشه‌های باقی‌مانده از کارهای قبلی)، و `.freebuff/`.
- سند `README.md` در ریشه (معرفی + لینک مستندات + پیش‌نیازها).
- `LICENSE.txt` (نوع لایسنس فروش + فهرست کتابخانه‌های ثالث) و `CHANGELOG.md` با نسخه شروع `1.0.0`.

**معیار پذیرش:** `git status` تمیز، هیچ `.env` یا کلیدی در مخزن نیست، `git ls-files | grep -i env` فقط `.env.example`ها را نشان دهد.

#### ب) وابستگی‌های آسیب‌پذیر

نتیجه `npm audit --omit=dev`:

```
53 vulnerabilities (7 low, 30 moderate, 14 high, 2 critical)
critical: nanoid, tar
high: dompurify, sharp, js-cookie, follow-redirects, postcss,
      @tiptap/core, prosemirror-view, @ai-sdk/provider-utils, ...
```

- ارتقای Next.js به آخرین patch امن نسخه ۱۵ (یا ۱۶ در صورت آماده بودن) و هم‌تراز کردن `eslint-config-next`.
- `npm audit fix` سپس بررسی دستی موارد breaking (`sharp`، `dompurify`، `@tiptap/*`).
- `composer update --with-dependencies` + `composer audit` برای بک‌اند.
- قفل نسخه‌ها در `package-lock.json` / `composer.lock` و کامیت آن‌ها.

**وضعیت (۱۰ نوامبر):** بخشی انجام شد — `ai` و وابستگی‌های مستقیم استفاده‌نشده‌ی `@tiptap/*` و `@blocknote/mantine` حذف شدند، BlockNote به 0.57 و postcss به 8.5.32 ارتقا یافت و مجموع audit از ۶۰ به ۱۴ مورد رسید (۰ critical جز Next، ۰ high جز sharp). تصمیم فعلی: **Next روی 15.3.3 می‌ماند** (طبق نظر کارفرما) و این یعنی هشدار critical خود Next — شامل RCE بدون احراز هویت در Image Optimizer و مسموم‌سازی کش RSC — باز می‌ماند. `NEXT_IMAGE_UNOPTIMIZED=1` در Docker بخشی از این سطح حمله را می‌بندد، ولی RCE/کش/میان‌افزار نه. بازبینی این تصمیم قبل از انتشار لازم است.

**معیار پذیرش:** `npm audit --omit=dev` بدون critical/high، `npm run lint` و `npm run build` سبز.

#### ج) وبهوک Stripe در استقرار Docker

**انجام شد (۱۰ نوامبر):** به‌جای پاس دادن secret از طریق compose، خود سکرت هم به پنل ادمین منتقل شد — ستون `stripe_webhook_secret` در `general_settings` (migration جدید)، فیلد `Stripe Webhook Signing Secret` در Settings → Payment Gateways با نمایش آدرس endpoint، خواندن آن در `GatewayConfigService::stripe()` و در `StripeWebhookController` (با fallback به env برای نصب‌های قبلی). حالا نصب تازه هیچ ویرایش `.env` نمی‌خواهد و مقدار خالی با لاگ صریح رد می‌شود.

- مستندسازی: `documentation/admin.html` (Payment Gateways)، `documentation/installation.html` (ورودی `STRIPE_*` به‌عنوان fallback) و `localhost/docs/STRIPE_WEBHOOK_SETUP.md` به‌روز شدند. ارسال secret از طریق compose لازم نیست و انجام نشد.

**معیار پذیرش:** در نصب Docker، یک checkout تستی Stripe هم از مسیر verify و هم از مسیر وبهوک نهایی شود.

#### د) مستندسازی بلاگ و محتوای صفحه اصلی

هیچ‌کدام از صفحات مستندات به blog اشاره نمی‌کنند (`grep -i blog documentation/*.html` خالی است):

- `admin.html`: بخش «Content» → Blog Posts (پیش‌نویس/انتشار/زمان‌بندی، تصویر کاور، نویسنده)، «Homepage Content» (بخش‌های hero / features_strip / blog و تاگل نمایش).
- `index.html`: افزودن بلاگ به feature map و «What ships in the box».
- `api.html`: افزودن `GET /api/v1/blog-posts` و `GET /api/v1/blog-posts/{slug}` + اشاره به `POST /api/v1/webhooks/stripe` و `/webhooks/mollie`.

#### ه) بسته‌بندی ZIP فروش

اسکریپت `scripts/package.sh` که خروجی تمیز بسازد:

- حذف: `.env*` (به‌جز `.example`ها)، `node_modules`، `.next`، `vendor`، `storage/logs/*`، `storage/app/*`، `.git`، `.freebuff`، `.tmp-db-migrate*`، `frontend;C`، `public/storage`.
- نگه‌داشتن: `documentation/`، `docker-compose.yml`، `.env.docker.example`، `README.md`، `LICENSE.txt`، `CHANGELOG.md`.

**معیار پذیرش:** ZIP در یک ماشین/پوشه تازه طبق مستندات نصب شود و بدون دست‌کاری اضافه بالا بیاید.

---

### ۳.۲ — P1: مهم برای تجربه خریدار

#### الف) SEO فروشگاه

- `frontend/src/app/sitemap.js` (دوره‌ها، دسته‌ها، مدرسین، بلاگ) با دامنه از `NEXT_PUBLIC_API_PROD_URL`.
- `frontend/src/app/robots.js` (allow + آدرس sitemap).
- `alternates.canonical` و `openGraph`/`twitter` پیش‌فرض در `generateMetadata` ریشه (اکنون فقط title/icon دارد؛ OG فقط در صفحه بلاگ هست).
- `frontend/src/app/not-found.jsx` و `error.jsx` سراسری (اکنون ۴۰۴/۵۰۰ پیش‌فرض Next است).

#### ب) تجربه اولین نصب

- فروشگاه بعد از نصب خالی است (Seeders فقط ادمین/تنظیمات/محتوای سایت را می‌سازند).
  - گزینه سبک: `DemoContentSeeder` اختیاری (`php artisan db:seed --class=DemoContentSeeder`) با چند دسته/دوره/مدرس نمونه بدون وابستگی به اینترنت.
  - یا حداقل یک بخش «۳ قدم برای شروع» در مستندات.
- تصاویر fallback `picsum.photos` در `Hero.jsx`، `HeroSlider.jsx` و چند صفحه دیگر → جایگزینی با asset محلی (`frontend/public/`) تا دموی آفلاین هم درست دیده شود.

#### ج) تست و CI

- ۳۰ فایل تست وجود دارد ولی هیچ CI ای نیست و تست‌ها به MySQL (`lms_testing`) وابسته‌اند.
- یک workflow ساده: `composer install` → `php artisan test` روی سرویس MySQL، و `npm ci` → `npm run lint` → `npm run build` برای فرانت.
- `vendor/bin/pint --test` و در صورت امکان PHPStan سطح پایه.

#### د) پاکسازی امنیتی/کیفی

- رندر `post.content` با `dangerouslySetInnerHTML` بدون sanitize است (`blog/[slug]/page.jsx`). نویسنده فقط ادمین است، بنابراین ریسک پایین؛ اما `dompurify` از قبل نصب است و می‌توان در سمت کلاینت/سرور اعمال کرد.
- ایمپورت‌های بلااستفاده‌ی mock در `instructors/[id]/InstructorDetails.jsx` (`teachers`, `courses`).
- `TODO(api)` در `frontend/src/config/courses.js` — تعیین تکلیف یا مستندسازی.
- بازبینی rate limit برای login/register/reset (throttleهای اختصاصی وجود دارد؛ فقط مستند شود).

---

### ۳.۳ — P2: بهبود اختیاری (بعد از انتشار هم ممکن است)

- افزودن `schedule:work` به `supervisord.conf` فقط اگر کار زمان‌بندی‌شده اضافه شد؛ اکنون هیچ `Schedule::` تعریف نشده، در حالی که `documentation/installation.html` از cron صحبت می‌کند → حداقل مستندات اصلاح شود.
- مستندسازی کامل‌تر API (۸۶ روت در برابر فهرست فعلی؛ webhooks و blog کامل نیست).
- یکسان‌سازی نسخه‌ها در مستندات (اکنون هم «Node 20» و هم «Node.js 18.18+» و هم PHP 8.2 در حالی که Docker از PHP 8.4/Node 22 استفاده می‌کند).
- بازبینی لایسنس فونت/تصاویر assetهای داخل `frontend/public`.

---

## ۴. نقشه راه پیشنهادی (فازبندی)

### فاز ۰ — پایه و بهداشت (۱ تا ۲ روز)
1. `git init` + `.gitignore` ریشه + کامیت اول.
2. حذف پوشه‌های زائد و فایل‌های موقت.
3. `README.md`، `LICENSE.txt`، `CHANGELOG.md`.
4. اسکریپت بسته‌بندی ZIP.

**خروجی:** مخزن سالم و قابل بازگشت؛ بسته تمیز.

### فاز ۱ — پایداری نصب و امنیت (۲ تا ۴ روز)
1. ارتقای وابستگی‌ها + `npm audit`/`composer audit` پاک.
2. `STRIPE_WEBHOOK_SECRET` — انجام شد از طریق پنل ادمین (بدون نیاز به env).
3. sanitize محتوای بلاگ + پاکسازی کد مرده.
4. تست نصب Docker از صفر (بعد از رفع مشکل داکر سیستم) روی یک دایرکتوری تازه.

**خروجی:** نصب Docker بدون خطا، پرداخت/وبهوک سالم، بدون آسیب‌پذیری critical.

### فاز ۲ — تجربه خریدار و SEO (۲ تا ۳ روز)
1. sitemap/robots/canonical/OG.
2. صفحات ۴۰۴/۵۰۰.
3. دموی نمونه یا راهنمای شروع سریع.
4. جایگزینی fallback تصاویر خارجی.

**خروجی:** فروشگاه قابل ارائه به‌عنوان demo.

### فاز ۳ — مستندات و بسته فروش (۲ تا ۳ روز)
1. به‌روزرسانی admin/index/api docs + بخش بلاگ.
2. رفع تناقض‌ها (cron، نسخه PHP/Node، env reference).
3. اسکرین‌شات‌ها (دسکتاپ + موبایل) و تصویر پیش‌نمایش ۵۹۰×۳۰۰.
4. متن آیتم، تگ‌ها، دسته‌بندی و لیست قابلیت‌ها.

### فاز ۴ — Release Candidate (۱ تا ۲ روز)
1. اجرای کامل تست‌ها + build فرانت + `php artisan optimize` در محیط شبیه تولید.
2. اسموک‌تست مسیرهای حیاتی: ثبت‌نام → خرید → دسترسی به درس → آزمون → گواهی → پنل ادمین → تسویه.
3. بسته‌بندی نهایی و آپلود.

---

## ۵. Definition of Done برای v1

- [ ] `git status` تمیز و همه تغییرات کامیت‌شده.
- [ ] هیچ `.env` واقعی/کلید/پسورد پیش‌فرض در بسته نیست.
- [ ] `npm audit --omit=dev` بدون critical/high و `composer audit` پاک.
- [ ] `npm run lint` و `npm run build` بدون خطا.
- [ ] `php artisan test` تمام تست‌ها سبز روی MySQL.
- [ ] نصب Docker از صفر فقط با `cp .env.docker.example .env` + دو مقدار ادمین بالا می‌آید.
- [ ] نصب دستی (بدون Docker) طبق `documentation/installation.html` کار می‌کند.
- [ ] پرداخت Stripe کامل (verify + webhook)، و بقیه درگاه‌ها حداقل verify.
- [ ] ایمیل واقعی (SMTP) برای تأیید ایمیل/ریست پسورد تست شده.
- [ ] بلاگ: نوشتن در پنل → دیده شدن در `/blog` و صفحه اصلی → تاگل بخش در Homepage Content.
- [ ] sitemap/robots/404/500 درست.
- [ ] مستندات بدون تناقض و شامل همه صفحات پنل.
- [ ] روی موبایل هم بدون شکستن لایوت اصلی.

---

## ۶. چک‌لیست ارسال به CodeCanyon

**اقلام اجباری:**
- [ ] ZIP تمیز (فقط سورس + مستندات + docker-compose + `.env` example).
- [ ] مستندات (HTML موجود + در صورت نیاز PDF) به‌روز و شامل نصب/پیکربندی/عیب‌یابی.
- [ ] `CHANGELOG.md` و شماره نسخه (مثلاً 1.0.0).
- [ ] توضیح آیتم: قابلیت‌ها، پیش‌نیازها، تکنولوژی‌ها، محدودیت‌ها.
- [ ] تصویر پیش‌نمایش ۵۹۰×۳۰۰ + حداقل ۶ اسکرین‌شات.
- [ ] دموی زنده + اطلاعات ورود ادمین/مدرس/دانشجو.
- [ ] سیاست پشتیبانی و پاسخ‌گویی (در توضیح آیتم).
- [ ] توضیح لایسنس (Regular/Extended) و فهرست کتابخانه‌های ثالث.
- [ ] تأیید اینکه هیچ کد رمزنگاری‌شده/مبهم و هیچ کلید اشتراکی در بسته نیست.

**بازبینی فنی که تیم CodeCanyon انجام می‌دهد:**
- [ ] نصب بدون خطا و بدون مرحله دستی پنهان.
- [ ] بدون `console.log`/`dd()`/کامنت‌های TODO در مسیرهای اصلی.
- [ ] خطاهای PHP/کنسول در سناریوهای عادی.
- [ ] ریسپانسیو و سازگاری مرورگر.
- [ ] سرعت بارگذاری معقول صفحه اصلی و دوره.

---

## ۷. ریسک‌ها

| ریسک | اثر | کاهش |
|---|---|---|
| ارتقای Next/Tiptap ناسازگاری ایجاد کند | تعویق انتشار | ارتقا در برنچ جدا + تست کامل قبل از merge |
| نصب روی هاست اشتراکی بدون Docker | پشتیبانی زیاد | مستندسازی واضح پیش‌نیازها + مسیر نصب دستی تست‌شده |
| وابستگی به اینترنت برای دموی تصاویر | دموی ناقص | asset محلی |
| حجم بالای آپلود ویدیو در هاست خریدار | خطای آپلود | محدودیت‌ها و توصیه S3 در مستندات (اکنون ۱GB تنظیم شده) |

---

## ۸. یادداشت محیط توسعه (خارج از محصول)

در زمان بررسی، Docker Desktop روی این سیستم به‌خاطر پر بودن درایو C (۳.۴GB آزاد از ۱۰۸GB) نتوانست دیسک داده WSL را mount کند:

```
wsl --mount --bare --vhd ...\docker_data.vhdx
Error code: Wsl/Service/AttachDisk/CreateVm/ERROR_TIMEOUT
```

پس از آزادسازی فضا (پاک‌سازی npm cache و Temp ≈ ۶GB) مشکل دیسک رفع شد؛ اگر دوباره تکرار شد: `wsl --shutdown` → بستن کامل Docker Desktop → اجرای مجدد، و در صورت نیاز ری‌استارت ویندوز. این مورد روی محصول اثری ندارد.
