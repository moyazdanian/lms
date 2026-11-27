#!/usr/bin/env python3
"""Build self-contained HTML pages for the marketplace artwork.

Everything (fonts, CSS, logo, mockups) is inlined so the pages render the
same in the preview browser without a web server or external assets.
"""

from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

FONTS = (HERE / "fonts.css").read_text(encoding="utf-8")
STYLES = (HERE / "design.css").read_text(encoding="utf-8")
LOGO = (ROOT / "brand" / "lms-logo-dark.svg").read_text(encoding="utf-8")

PARTIALS = {
    "BROWSER": (HERE / "partials" / "browser.html").read_text(encoding="utf-8"),
    "COURSE": (HERE / "partials" / "course.html").read_text(encoding="utf-8"),
    "CERTIFICATE": (HERE / "partials" / "certificate.html").read_text(encoding="utf-8"),
    "TOAST": (HERE / "partials" / "toast.html").read_text(encoding="utf-8"),
}

PAGES = {
    "cover.src.html": "cover.html",
    "thumb-590.src.html": "thumb-590.html",
    "thumb-800.src.html": "thumb-800.html",
}

for source, target in PAGES.items():
    html = (HERE / source).read_text(encoding="utf-8")
    html = html.replace("{{FONTS_CSS}}", FONTS)
    html = html.replace("{{DESIGN_CSS}}", STYLES)
    html = html.replace("{{LOGO}}", LOGO)
    for name, markup in PARTIALS.items():
        html = html.replace("{{" + name + "}}", markup)
    (HERE / target).write_text(html, encoding="utf-8")
    print(f"  {target}  ({len(html) / 1024:.0f} KB)")
