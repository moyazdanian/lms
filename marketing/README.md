# Marketing assets

Listing artwork for the CodeCanyon and Codester product pages. None of this is
shipped to buyers; `/marketing/` is excluded from the release ZIP in
`.gitattributes`.

## Files

| File | Use |
|---|---|
| `codecanyon/cover-2340x1560.png` | CodeCanyon cover image, 3:2 |
| `codecanyon/thumbnail-590x300.png` | CodeCanyon first inline preview |
| `codecanyon/thumbnail-590x300.jpg` | JPG alternative for the same preview |
| `codecanyon/thumbnail-80x80.png` | CodeCanyon small thumbnail |
| `codecanyon/thumbnail-80x80.jpg` | JPG thumbnail (Envato's documented format) |
| `codester/preview-1600x800.png` | Codester preview, 2× / retina |
| `codester/preview-800x400.png` | Codester preview, upload-guide size |
| `codester/icon-400x400.png` | Codester icon, 2× / retina |
| `codester/icon-200x200.png` | Codester icon, upload-guide size |
| `codester/screenshots.zip` | Codester gallery, nine ready 1366×900 screenshots |
| `codester/screenshots/gallery-preview.jpg` | Local review sheet for the nine screenshots |
| `brand/lms-logo-dark.svg` | Horizontal lockup for dark backgrounds |
| `brand/lms-logo-light.svg` | Horizontal lockup for light backgrounds |
| `brand/lms-logo-dark-1600.png` | PNG lockup, transparent background |
| `brand/lms-logo-light-1600.png` | PNG lockup, transparent background |
| `brand/lms-mark.svg` | App mark, rounded tile |
| `brand/lms-mark-square.svg` | App mark, full-bleed square |
| `brand/lms-mark-512.png` / `-128` / `-80` | Mark exports |
| `brand/lms-mark-square-1024.png` | High-res square mark |

`MARKETPLACE-PLAN.md` covers distribution, updates, demo strategy, licensing,
pricing and the launch checklist. `codester/README.md` is the actual Codester
submission sheet, with the listing copy, tags, category, upload files and the
nine-image screenshot gallery.

The marketplace ZIPs keep the local checkout untouched and rename the Laravel
folder from `localhost/` to `backend/` at build time (the handbook, compose file,
README and license are updated to match). The Codester buyer ZIP is built
separately because it needs the Codester license instead of the Envato one:

```bash
# final release (clean commit)
bash scripts/package-codester.sh

# staging candidate while the tree still has uncommitted work
ALLOW_DIRTY=1 bash scripts/package-codester.sh
```

Rebuild the screenshot ZIP from the captures with:

```bash
python scripts/build-codester-gallery.py
```

## Brand

- **Name on the artwork:** LMS (white-label; the buyer changes `site_name` in
  the admin panel). If you want a separate brand, replace the outlined `LMS`
  paths in `design/build_brand.py`; the mark stays the same.
- **Mark:** a speech bubble with a play-button cutout and an amber notification
  dot — lessons, video and instructor interaction in one glyph.
- **Palette:** ink `#070B16`, electric blue `#3B82F6`, indigo `#4F46E5`,
  violet `#7C3AED`, amber `#FBBF24`, cloud `#F8FAFC`.
- **Type:** Geist (variable) for UI/headlines, Instrument Serif Italic for the
  accent word. Both are bundled in `fonts/` (SIL OFL).
- **Tagline:** “Your academy. Your rules.”

## Regenerate

The artwork pages are self-contained (fonts, CSS, logo and mockups inlined), so
they render without a server.

```bash
# Outline the logo and build the inline pages
python marketing/design/build_brand.py
python marketing/design/build_pages.py

# Render with headless Chrome. --window-size height is asset height + 82px
# (headless Chrome reserves window chrome); crop to the asset height after.
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --run-all-compositor-stages-before-draw \
  --virtual-time-budget=2500 --window-size=2340,1642 \
  --screenshot=marketing/design/cover-raw.png \
  file:///D:/projects/lms/marketing/design/cover.html
```

The raw screenshot is 82px taller than the asset because headless Chrome keeps
window chrome. Crop the top 1560px (or 600px / 800px for the thumbnails) with
`sharp(...).extract(...)` as the checked-in build does.

`build_brand.py` needs `fonttools` and `brotli`:

```bash
python -m pip install --target marketing/.pytools fonttools brotli
PYTHONPATH=marketing/.pytools python marketing/design/build_brand.py
```

## Note for the listing

The dashboard and course cards on the cover are a **designed representation** of
the UI, not screenshots of the running app. The Codester gallery is now filled
with nine real screenshots from a seeded installation; CodeCanyon can use a
larger gallery if its form allows more than nine.
