# طرح انتشار LMS در CodeCanyon و Codester

این سند برای فروش همین پروژه (Laravel API + Filament + Next.js storefront، مبتنی بر Docker) در دو بازار CodeCanyon و Codester نوشته شده است. هدف: تحویل فایل به خریدار، مسیر آپدیت ساده و قابل‌اعتماد، تصمیم درست دربارهٔ دمو، و آماده‌سازی assets و listing.

---

## خلاصهٔ تصمیم‌ها

1. **Git ندهید.** خریدار یک ZIP از بازار دانلود می‌کند؛ دسترسی به repo باعث لو رفتن کل تاریخچه، کد و احتمالاً secretها می‌شود و قابل مدیریت نیست.
2. **یک codebase، یک بسته.** پروژهٔ دموی جدا نسازید. برای دمو، همان بسته + `DemoSeeder` و در صورت نیاز `DEMO_MODE` کافی است.
3. **آپدیت = ZIP کامل + CHANGELOG + راهنمای ارتقا.** بازارها خودشان آپدیت را تحویل می‌دهند؛ auto-updater و license server را فعلاً نسازید.
4. **مستندات باید عمومی باشند.** CodeCanyon مستندات را الزامی کرده و می‌گوید نباید پشت purchase key باشد. `documentation/` را روی یک subdomain عمومی منتشر کنید.
5. **دموی لایو لازم نیست، ولی برای LMS خیلی مؤثر است.** بدون دمو می‌توانید لانچ کنید (CodeCanyon اجباری نکرده)، اما Codester ممکن است بعضی آیتم‌ها را بدون دمو رد کند و نرخ تبدیل LMS بدون admin demo پایین است.
6. **لایسنس را جدی بگیرید.** در Envato اگر دانشجو برای دسترسی به دوره پول بدهد، خریدار به **Extended License** نیاز دارد، نه Regular. برای Codester یک لایسنس جدا ساخته شد و بستهٔ مخصوص همان بازار با `scripts/package-codester.sh` تولید می‌شود؛ `LICENSE.txt` انواتو را داخل بستهٔ کدستر نفرستید.
7. **برند فعلی: LMS (white-label).** لوگو و کاور با همین نام آماده شده‌اند؛ خریدار نام سایت را از پنل ادمین عوض می‌کند. اگر برند جداگانه می‌خواهید، فقط wordmark را جایگزین کنید.

### بازارها در یک نگاه

| | CodeCanyon | Codester |
|---|---|---|
| تحویل | ZIP از Downloads | ZIP از Downloads |
| آپدیت | ZIP جدید + بازبینی/انتشار | ZIP جدید + بازبینی (معمولاً ۱–۲ روز کاری) |
| دمو | توصیهٔ شدید؛ اجباری نیست | برای بعضی آیتم‌ها بدون دمو رد می‌شود |
| لایسنس | Regular فقط برای دسترسی رایگان؛ دسترسی پولی/فروش دوره = Extended | Regular برای یک پروژه و استفادهٔ تجاری؛ Extended برای چند پروژه/توزیع |
| کمیسیون | شرایط فعلی Author Hub را چک کنید | ۷۰٪ نویسنده / ۳۰٪ پلتفرم |
| مستندات | الزامی و عمومی (بدون purchase key) | الزامی، داخل ZIP |

---

## ۱. توزیع فایل‌ها به خریدار

### ۱.۱ مدل پیشنهادی: فروشگاه بازار + ZIP

بازار (CodeCanyon / Codester) فایل را میزبانی و به خریدار تحویل می‌دهد. خریدار از صفحهٔ **Downloads** فایل را می‌گیرد و برای آپدیت دوباره همان فایل را دانلود می‌کند.

- هیچ‌جا لینک GitHub/GitLab به خریدار ندهید.
- در ZIP هیچ `.git/`، `.env` واقعی، `storage/app`، `node_modules/`، `vendor/`، `.next/`، `dist/` یا دامپ دیتابیس نباشد.
- فایل `README.md`، `CHANGELOG.md`، `LICENSE.txt`، `docker-compose.yml`، `.env.docker.example` و `documentation/` باید داخل بسته باشند.
- بسته باید یک پوشهٔ ریشه داشته باشد (`lms-1.0.0/`) و فایل‌ها در ریشهٔ ZIP پراکنده نباشند.

ساختار پیشنهادی:

```text
lms-1.0.0/
├── README.md
├── CHANGELOG.md
├── UPGRADING.md              ← مسیر ارتقا و rollback
├── LICENSE.txt               ← در بستهٔ کدستر: شرایط Codester
├── docker-compose.yml
├── .env.docker.example
├── docker/
├── backend/                  ← Laravel + Filament (در چک‌اوت لوکال: localhost/)
├── frontend/                 ← Next.js
└── documentation/            ← نسخهٔ آفلاین هندبوک
```

اسکریپت فعلی [scripts/package.sh](../scripts/package.sh) همین کار را با `git archive` انجام می‌دهد، فایل‌های توسعه‌ای را با `.gitattributes` حذف می‌کند و قبل از ساخت ZIP وجود secret و build output را چک می‌کند. همین مسیر را نگه دارید؛ `UPGRADING.md` آماده است و `marketing/` با `.gitattributes` از بسته خارج می‌شود.

### ۱.۲ چرا Git ندهیم؟

| گزینه | مشکل |
|---|---|
| Public repo | کل سورس و تاریخچه برای همه قابل clone است؛ فروش از دست می‌رود. |
| Private repo برای هر خریدار | تعداد repoها و دسترسی‌ها قابل مدیریت نیست؛ لغو دسترسی بعد از refund دردسر دارد؛ خریدار ممکن است repo را لو بدهد. |
| Git به‌عنوان «کانال آپدیت» | خریدار باید merge/conflict حل کند؛ اکثر خریداران کدنویس حرفه‌ای نیستند. |

اگر خودتان به Git نیاز دارید، repo خصوصی خودتان را برای CI و تاریخچه نگه دارید؛ خریدار فقط ZIP بازار را می‌گیرد. برای خریدارانی که واقعاً diff می‌خواهند، در `CHANGELOG.md` فهرست فایل‌های تغییرکرده را بنویسید یا یک **patch ZIP** اختیاری در سایت پشتیبانی بگذارید (نه به‌جای بستهٔ اصلی).

### ۱.۳ مستندات عمومی (الزام CodeCanyon)

مستندات باید:

- نصب، پیکربندی، استفاده و customization را توضیح دهد؛
- انگلیسی و به‌صورت HTML یا PDF باشد؛
- **بدون purchase key** در دسترس باشد؛
- شامل پیش‌نیازها، نصب Docker، تنظیم `.env`، مهاجرت‌ها، صف/کرون، درگاه‌ها، S3، ایمیل، بکاپ و آپدیت باشد؛
- برای نسخهٔ فعلی و نسخهٔ قبلی (مسیر ارتقا) معتبر باشد.

پیشنهاد: `documentation/` را روی `docs.example.com` (Caddy یا Cloudflare Pages) منتشر کنید و لینک آن را در توضیحات آیتم بگذارید. نسخهٔ آفلاین هم داخل ZIP بماند.

### ۱.۴ مجوز و لایسنس

**Envato / CodeCanyon**

- **Regular**: فقط end product رایگان. اگر بخشی از سایت نیاز به پرداخت/اشتراک داشته باشد، Regular کافی نیست.
- **Extended**: end product می‌تواند فروخته شود یا دسترسی پولی داشته باشد.
- LMS شما برای فروش دوره ساخته شده؛ تقریباً همهٔ استفاده‌های واقعی **Extended** هستند. Extended را در تنظیمات آیتم فعال کنید و در توضیحات صریح بنویسید:
  > If you charge students for course access, you need the Extended License.
- یک لایسنس = یک نصب/end product. نصب دوم لایسنس دوم می‌خواهد.
- توزیع مجدد سورس تحت هیچ لایسنسی مجاز نیست.

**Codester**

- Regular: یک پروژه، استفادهٔ تجاری مجاز، بدون فروش مجدد سورس.
- Extended: چند پروژه و امکان توزیع به‌عنوان بخشی از محصول بزرگ‌تر.
- شرایط Codester با Envato یکی نیست؛ جملهٔ «این آیتم تحت لایسنس Envato فروخته می‌شود» برای خریدار Codester اشتباه است.

**اقدام انجام‌شده:** برای Codester یک لایسنس جدا در `marketing/codester/LICENSE.txt` نوشته شد و `scripts/package-codester.sh` آن را به‌جای `LICENSE.txt` انواتو داخل ZIP کدستر قرار می‌دهد. بنابراین بستهٔ کدستر هیچ اشاره‌ای به Envato/CodeCanyon ندارد و شرایط Regular/Extended خود Codester را توضیح می‌دهد.

`LICENSE.txt` ریشه همچنان نسخهٔ Envato است و برای بستهٔ CodeCanyon می‌ماند. دو بستهٔ جدا بسازید و هر کدام را فقط در بازار خودش آپلود کنید. متن حقوقی را قبل از انتشار با یک حقوقی/پشتیبانی بازار چک کنید؛ این فایل خلاصهٔ عملی است، نه مشاورهٔ حقوقی.

**DRM و domain lock:** برای این محصول پیشنهاد نمی‌شود. خریدار self-hosted انتظار کنترل دارد؛ domain lock پشتیبانی و نصب محلی/استیجینگ را خراب می‌کند و در عمل جلوی piracy را نمی‌گیرد. تمرکز را روی لایسنس، آپدیت و پشتیبانی بگذارید.

---

## ۲. آپدیت‌ها: مسیر ساده و قابل‌اعتماد

### ۲.۱ اصل کار

- نسخه‌گذاری **SemVer** (`1.0.0`، `1.0.1`، `1.1.0`).
- هر نسخه یک ورودی در `CHANGELOG.md` با تاریخ و دسته‌بندی `Added / Changed / Fixed / Security`.
- هر انتشار = ZIP کامل جدید در بازار + به‌روزرسانی توضیحات آیتم («Last update»).
- خریدار دوباره از Downloads دانلود می‌کند؛ بازار نوتیفیکیشن آپدیت را (در صورت فعال بودن) می‌فرستد.
- هیچ auto-download یا license server در v1 نسازید. اگر بعداً خواستید، فقط یک **چک نسخه** ساده اضافه کنید، نه نصب خودکار.

### ۲.۲ انتشار نسخه

```bash
# 1) نسخه و تاریخ را در بالای CHANGELOG.md بنویسید
# 2) commit کنید
git add CHANGELOG.md UPGRADING.md
git commit -m "Release 1.0.1"

# 3) بسته را بسازید (نسخه از CHANGELOG خوانده می‌شود)
scripts/package.sh 1.0.1

# 4) تگ بزنید
git tag v1.0.1

# 5) ZIP را در بازار آپلود کنید و release notes را وارد کنید
```

`scripts/package.sh` فقط روی working tree تمیز کار می‌کند؛ همین رفتار را حفظ کنید تا بسته دقیقاً با یک commit مشخص مطابقت داشته باشد.

### ۲.۳ مسیر ارتقای خریدار (Docker)

این متن در `UPGRADING.md` آماده است؛ همان را در صفحهٔ docs هم منتشر کنید:

```bash
# 0) از دیتابیس و فایل‌های محلی بکاپ بگیرید
docker compose exec -T mysql sh -c \
  'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > backup-$(date +%F).sql
cp .env .env.backup
# اگر FILESYSTEM_DISK=local است، از volume یا backend/storage/app هم بکاپ بگیرید

# 1) نسخهٔ جدید را در یک پوشهٔ تازه باز کنید
# 2) .env قبلی را کپی کنید و storage محلی را حفظ کنید
# 3) استک را با image جدید بالا بیاورید
docker compose up -d --build

# 4) وضعیت را چک کنید
docker compose ps
docker compose logs --tail=100 api
curl -fsS https://example.com/up
```

- entrypoint فعلی در هر بوت `php artisan migrate --force` را اجرا می‌کند؛ بنابراین مهاجرت‌ها خودکارند. این رفتار را در docs توضیح دهید.
- اگر خریدار از S3 استفاده می‌کند، فایل‌های ویدیو/پیوست دست نمی‌خورند؛ فقط `.env` و دیتابیس مهم‌اند.
- rollback: پوشهٔ قبلی و دامپ دیتابیس را نگه دارید؛ در صورت خطا `docker compose down`، پوشهٔ قبلی را برگردانید و در صورت نیاز دامپ را restore کنید.
- برای تغییرات دیتابیسی بزرگ، در `UPGRADING.md` دستور مهاجرت دستی و زمان تقریبی را بنویسید.

### ۲.۴ آیا patch ZIP لازم است؟

- برای نسخهٔ اول: **نه**. ZIP کامل + `UPGRADING.md` کافی است.
- اگر بعداً خریداران customization زیاد داشتند: یک ZIP اختیاری `lms-1.0.1-update.zip` شامل فقط فایل‌های تغییرکرده + فهرست فایل‌ها + دستور مهاجرت، در سایت پشتیبانی (عمومی و بدون purchase key) بگذارید. این به خریدارانی که فایل را دستی تغییر داده‌اند کمک می‌کند، ولی جایگزین بستهٔ اصلی نیست.
- برای هر patch، مسیر ارتقا را روی یک نصب تمیز و یک نصب دارای داده تست کنید.

### ۲.۵ چک آپدیت داخل پنل (اختیاری، فاز ۲)

اگر خواستید خریدار بفهمد نسخهٔ جدید هست:

- یک فایل JSON امضاشده در دامنهٔ خودتان (`/lms/latest.json`) با `version`, `released_at`, `notes_url`, `download_url` بگذارید.
- در پنل ادمین یک notice کوچک نشان دهید: «نسخهٔ ۱.۰.۱ موجود است» + لینک به صفحهٔ آیتم در بازار.
- هرگز فایل را خودکار دانلود/جایگزین نکنید و هیچ قابلیتی را پشت لایسنس/سرور خودتان قفل نکنید. خریدار باید بداند آپدیت از بازار رسمی می‌آید.

---

## ۳. دمو: پروژهٔ جدا لازم نیست

### ۳.۱ تصمیم

**یک codebase، یک بسته.** یک پروژهٔ دموی جدا نسازید. دمو فقط یک **نصب جداگانه از همان بسته** با دیتابیس seed شده و تنظیمات محدود است.

اگر همین حالا دموی لایو نمی‌خواهید:

- لانچ را متوقف نکنید؛ CodeCanyon دموی لایو را اجباری نکرده است.
- ولی برای LMS، دموی ادمین/مدرس/دانشجو یکی از بزرگ‌ترین عوامل تبدیل است. حداقل ۱۰–۱۲ اسکرین‌شات واقعی + ویدیوی ۶۰–۹۰ ثانیه‌ای آماده کنید.
- Codester ممکن است بعضی آیتم‌ها را بدون دمو رد کند؛ اگر رد شدید، دمو را اضافه کنید.

### ۳.۲ گزینه‌ها

| گزینه | هزینه | اثر | پیشنهاد |
|---|---|---|---|
| بدون دموی لایو، فقط اسکرین‌شات + ویدیو | کم | قابل قبول در CodeCanyon؛ تبدیل پایین‌تر؛ ریسک رد در Codester | برای لانچ فوری |
| دموی میزبانی‌شده روی subdomain جدا | متوسط | بهترین تبدیل؛ خریدار قبل از خرید همه‌چیز را می‌بیند | توصیهٔ اصلی |
| دموی محلی برای خریدار (`demo:seed` + docs) | کم | فقط بعد از خرید؛ برای مستندات خوب است | مکمل |

### ۳.۳ اگر دمو ساختید

- **نصب جداگانه**: همان ZIP، دیتابیس جدا، S3/ایمیل تست، دامنهٔ جدا (`demo.example.com`).
- **داده**: ۳–۵ دوره، چند مدرس، دانشجو، سفارش، نظر، آزمون و مدرک؛ داده‌ها واقعی و تمیز باشند.
- **دسترسی**: admin / instructor / student با credential منتشرشده. دموی فقط-front-end برای LMS کافی نیست.
- **ایمنی**: پرداخت‌ها در حالت تست؛ SMTP خاموش یا گیرندهٔ تست؛ آپلود به S3 واقعی نباشد؛ عملیات مخرب (حذف/تنظیمات/پرداخت) محدود یا read-only؛ ریست شبانه؛ `noindex`؛ بنر «Demo — data resets».
- **iframe**: هر دو بازار دمو را در iframe نشان می‌دهند؛ `X-Frame-Options` را روی DENY نگذارید، CSP را تست کنید، و لینک/دکمهٔ خرید در دمو نگذارید.
- **نظارت**: دمو را مانیتور کنید؛ اگر خراب شد، سریع ریست شود.

### ۳.۴ DemoSeeder در همان پروژه

اگر بعداً دموی محلی/میزبانی‌شده خواستید، یک `DemoSeeder` در `localhost/database/seeders` اضافه کنید که:

- کاربران demo با نقش‌های admin/instructor/student بسازد؛
- دوره و درس و ویدیوی نمونه (فایل کوچک یا URL تست) بسازد؛
- سفارش/نظر/مدرک نمونه بسازد؛
- idempotent باشد و روی نصب واقعی به‌صورت تصادفی اجرا نشود.

این کار جدا از بستهٔ اصلی نیست؛ همان codebase است.

---

## ۴. Listing و assets

### ۴.۱ اندازه‌ها

| بازار | asset | اندازه |
|---|---|---|
| CodeCanyon | Cover (3:2) | **2340×1560** (حداقل 1170×780) |
| CodeCanyon | اولین preview inline | **590×300** |
| CodeCanyon | thumbnail کوچک | **80×80** |
| CodeCanyon | previewهای بعدی | عرض ۱۱۷۰، حداکثر ارتفاع ۱۵۰۰ (۳ تا ۱۵ تصویر) |
| Codester | preview | **1600×800** (راهنمای آپلود ۸۰۰×۴۰۰ هم می‌گوید) |
| Codester | icon | **400×400** (راهنمای آپلود ۲۰۰×۲۰۰ هم می‌گوید) |
| Codester | screenshots | ۳–۹ تصویر؛ ۸–۹ تصویر واقعی پیشنهاد می‌شود |

فایل‌های آماده در پوشهٔ `marketing/`:

- `codecanyon/cover-2340x1560.png`
- `codecanyon/thumbnail-590x300.png`
- `codecanyon/thumbnail-80x80.png`
- `codester/preview-1600x800.png` و `codester/preview-800x400.png`
- `codester/icon-400x400.png` و `codester/icon-200x200.png`
- `codester/README.md` (فرم آپلود، متن listing و چک‌لیست)
- `brand/lms-logo-dark.svg` / `brand/lms-logo-light.svg`
- `brand/lms-mark.svg` / `brand/lms-mark-square.svg`
- `brand/lms-logo-dark-1600.png` / `brand/lms-logo-light-1600.png`

> کاور و تامبنیل فعلی یک **نمای طراحی‌شده** از UI هستند، نه اسکرین‌شات واقعی. برای listing نهایی، حتماً ۸–۱۲ اسکرین‌شات واقعی از نصب دمو اضافه کنید. کاور می‌تواند بماند، ولی گالری باید محصول واقعی را نشان دهد.

### ۴.۲ عنوان پیشنهادی

- `LMS — Learning Management System | Laravel 12 + Next.js 15`
- `LMS - Course & Learning Management System (Laravel + Next.js)`
- `LMS - Self-Hosted Learning Platform with Instructor Marketplace`

فرمول بازار: Brand/نام + LMS + Learning Management System + تمایز (Laravel/Next.js/Self-hosted/Marketplace). از «Best» و قیمت در عنوان استفاده نکنید.

### ۴.۳ قیمت

محدودهٔ فعلی LMSهای مشابه: CodeCanyon حدود $۲۶–$۶۹ (Academy/Rocket حدود $۵۵، Mentor حدود $۲۶–۲۹، SkillGro $۶۹)، Codester حدود $۳۹–$۵۴.

پیشنهاد:

- **Regular**: $۴۹–$۵۹ (اگر می‌خواهید سریع‌تر فروش برود، $۳۹ برای مدت محدود؛ کمتر از $۲۹ نروید).
- **Extended**: حدود ۵× Regular، مثلاً $۲۴۹–$۲۹۹. برای LMSی که دوره می‌فروشد، Extended معمولاً انتخاب واقعی است.
- روی هر دو بازار قیمت نزدیک نگه دارید تا خریدار احساس بی‌عدالتی نکند.

### ۴.۴ متن توضیحات

ساختار پیشنهادی:

1. یک پاراگراف: چیست، برای چه کسی، چه مشکلی را حل می‌کند.
2. «What you get»: storefront، instructor marketplace، ۴ درگاه، آزمون/مدرک، ادمین Filament، Docker.
3. Tech stack + requirements (Docker، ۲GB RAM، SMTP، S3 اختیاری).
4. Demo link + credentialهای admin/instructor/student (اگر دمو دارید).
5. Documentation link (عمومی).
6. Installation summary: `cp .env.docker.example .env` → `docker compose up -d --build`.
7. Changelog/Last update.
8. License: توضیح Regular/Extended؛ برای فروش دوره Extended لازم است.
9. Support: ۶ ماه، چه چیزی شامل است و چه چیزی نه (نصب رایگان، customization، سرور).
10. FAQ: مهاجرت از نسخهٔ قبل، بکاپ، S3، ایمیل، پرداخت تست.

هیچ‌جا بازار دیگر را نام نبرید و لینک خرید جای دیگر نگذارید. اگر هم‌زمان در CodeCanyon و Codester می‌فروشید، دو listing مستقل با متن‌های سازگار داشته باشید.

---

## ۵. چک‌لیست قبل از انتشار

### بسته و نصب

- [ ] working tree تمیز؛ ZIP با `scripts/package.sh` ساخته شده.
- [ ] ZIP را در یک سرور/پوشهٔ خالی باز کنید و از صفر نصب کنید.
- [ ] `.env.docker.example` هیچ secret واقعی ندارد؛ `ADMIN_EMAIL/PASSWORD` اجباری است.
- [ ] `docker compose up -d --build` روی نصب تازه کار می‌کند؛ `/up` سالم است.
- [ ] ورود ادمین، ساخت دوره، آپلود ویدیو، خرید تست، مدرک و ایمیل تست شده.
- [ ] با S3 و بدون S3 تست شده.
- [ ] `storage/`، `.next/`، `vendor/`، `node_modules/` و `.git/` در ZIP نیست.
- [ ] `LICENSE.txt` با بازار مقصد سازگار است.
- [ ] `CHANGELOG.md` و `UPGRADING.md` داخل بسته‌اند.
- [ ] مستندات روی URL عمومی و بدون purchase key است.

### آپدیت

- [ ] نسخهٔ 1.0.0 نصب شده، داده ساخته شده، سپس 1.0.1 اعمال شده.
- [ ] مهاجرت‌ها روی دیتابیس دارای داده اجرا شده‌اند.
- [ ] مسیر rollback تست شده.
- [ ] `CHANGELOG` فایل‌های تغییرکرده/مهاجرت‌ها را ذکر کرده.
- [ ] ZIP جدید در بازار آپلود شده و release notes وارد شده.
- [ ] توضیحات آیتم «Last update» و لینک changelog را نشان می‌دهد.

### Listing

- [ ] cover 2340×1560، اولین preview 590×300، 80×80.
- [ ] Codester: 800×400 و 200×200.
- [ ] ۸–۱۲ اسکرین‌شات واقعی + ویدیوی ۶۰–۹۰ ثانیه‌ای.
- [ ] دمو (اگر دارید) در iframe تست شده و credentialها کار می‌کنند.
- [ ] عنوان و توضیحات شامل Laravel/Next.js/Self-hosted هستند.
- [ ] قیمت Regular/Extended و توضیح لایسنس درج شده.
- [ ] هیچ اشاره‌ای به بازار دیگر یا لینک خرید خارجی نیست.
- [ ] support channel و سیاست ۶ ماه مشخص است.

---

## ۶. منابع

- Envato Code Item Preparation & Technical Requirements — <https://help.author.envato.com/hc/en-us/articles/360000471583-Code-Item-Preparation-Technical-Requirements>
- Envato Item Presentation Requirements — <https://help.author.envato.com/hc/en-us/articles/360000424863-Item-Presentation-Requirements>
- Envato adding preview images (590×300) — <https://help.author.envato.com/hc/en-us/articles/360000471326-Adding-Key-Features-and-Additional-images-to-your-items>
- Envato live previews — <https://help.author.envato.com/hc/en-us/articles/900004305306-Live-Previews-for-Envato-Market>
- Envato Regular vs Extended — <https://help.market.envato.com/hc/en-us/articles/115005593363-Which-Envato-Market-Licence-Do-I-Need>
- Envato updates/downloads — <https://help.market.envato.com/hc/en-us/articles/204498364-How-do-I-update-my-purchased-items-and-manage-notifications>
- Envato item support — <https://help.market.envato.com/hc/en-us/articles/208191263-What-is-Item-Support-and-what-s-included>
- Codester upload guide — <https://www.codester.com/info/upload>
- Codester licenses — <https://www.codester.com/info/licenses>
- Codester update process — <https://support.codester.com/hc/en-us/articles/115000018949-How-can-I-update-my-item>
- Codester review time — <https://support.codester.com/hc/en-us/articles/115000017305-How-long-does-it-take-before-my-item-gets-reviewed>
- Codester commission — <https://support.codester.com/hc/en-us/articles/115000017385-What-commission-rate-do-authors-receive>

> نکته: قوانین و درصدها ممکن است تغییر کنند؛ قبل از انتشار، همین صفحه‌ها و پنل Author را دوباره چک کنید.
