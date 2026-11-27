#!/usr/bin/env python3
"""Build the LMS logo assets as self-contained SVG files.

The wordmark is converted to outlines, so the files do not depend on a font
being installed on the machine that opens them.
"""

from __future__ import annotations

import base64
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT_PATH = ROOT / "fonts" / "Geist-Variable.ttf"
OUT = ROOT / "brand"
OUT.mkdir(parents=True, exist_ok=True)

# Brand palette -------------------------------------------------------------
INK = "#0B1220"
CLOUD = "#F8FAFC"
MUTED_LIGHT = "#64748B"
MUTED_DARK = "#94A3B8"
AMBER = "#FBBF24"

# The speech-bubble / play glyph, drawn on a 512 canvas.
BUBBLE = (
    "M184 136 H328 "
    "A72 72 0 0 1 400 208 "
    "V292 "
    "A72 72 0 0 1 328 364 "
    "H272 "
    "L176 448 "
    "C168 455 156 448 160 436 "
    "L184 364 "
    "A72 72 0 0 1 112 292 "
    "V208 "
    "A72 72 0 0 1 184 136 Z"
)
PLAY = "M246 210 Q234 204 234 218 V294 Q234 308 246 302 L330 264 Q342 256 330 248 Z"

MARK_DEFS = """<defs>
  <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3B82F6"/>
    <stop offset="0.52" stop-color="#4F46E5"/>
    <stop offset="1" stop-color="#7C3AED"/>
  </linearGradient>
  <radialGradient id="brandSheen" cx="0.16" cy="0.08" r="0.95">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/>
    <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.04"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
</defs>"""

MARK_GLYPH = (
    f'<path fill="#FFFFFF" fill-rule="evenodd" d="{BUBBLE} {PLAY}"/>'
)


def load_font(weight: int) -> TTFont:
    font = TTFont(FONT_PATH)
    return instantiateVariableFont(font, {"wght": weight}, inplace=True)


def text_path(
    font: TTFont,
    text: str,
    size: float,
    x: float,
    baseline: float,
    tracking: float = 0.0,
) -> tuple[str, float]:
    """Return SVG paths for `text`, plus the final cursor position.

    Coordinates are in the font's 1000-unit em and are flipped into SVG's
    y-down space by the per-glyph transform.
    """

    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    hmtx = font["hmtx"]

    parts: list[str] = []
    cursor = x

    for char in text:
        name = cmap.get(ord(char))
        if name is None:
            cursor += size * 0.32
            continue

        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        commands = pen.getCommands()
        if commands:
            parts.append(
                f'<path transform="translate({cursor:.3f} {baseline:.3f}) '
                f'scale({scale:.6f} {-scale:.6f})" d="{commands}"/>'
            )
        cursor += hmtx[name][0] * scale + tracking

    return "".join(parts), cursor - tracking


def mark_svg(*, radius: int = 120, with_dot: bool = True) -> str:
    dot = (
        f'<circle cx="404" cy="108" r="36" fill="{AMBER}" '
        f'stroke="{INK}" stroke-width="12"/>'
        if with_dot
        else ""
    )
    border = (
        '<rect x="1" y="1" width="510" height="510" rx="119" fill="none" '
        'stroke="#FFFFFF" stroke-opacity="0.14"/>'
        if radius
        else ""
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="LMS logo">
{MARK_DEFS}
<rect width="512" height="512" rx="{radius}" fill="url(#brandGradient)"/>
<rect width="512" height="512" rx="{radius}" fill="url(#brandSheen)"/>
{MARK_GLYPH}
{dot}
{border}
</svg>
"""


def mono_svg() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="LMS logo">
<path fill="currentColor" fill-rule="evenodd" d="{BUBBLE} {PLAY}"/>
</svg>
"""


def lockup_svg(*, dark: bool) -> str:
    weight = 720
    font = load_font(weight)

    word_x = 138.0
    word_baseline = 63.0
    word_size = 76.0
    word_tracking = -4.0

    word_paths, word_end = text_path(
        font, "LMS", word_size, word_x, word_baseline, word_tracking
    )

    descriptor = "LEARNING PLATFORM"
    descriptor_size = 13.4
    descriptor_tracking = 2.6
    descriptor_paths, descriptor_end = text_path(
        font,
        descriptor,
        descriptor_size,
        word_x + 1.5,
        94.0,
        descriptor_tracking,
    )

    width = max(word_end, descriptor_end) + 6
    foreground = CLOUD if dark else INK
    muted = MUTED_DARK if dark else MUTED_LIGHT

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} 118" role="img" aria-label="LMS — Learning Management System">
{MARK_DEFS}
<g transform="translate(0 3)">
  <rect width="112" height="112" rx="26" fill="url(#brandGradient)"/>
  <rect width="112" height="112" rx="26" fill="url(#brandSheen)"/>
  <g transform="scale(0.21875)">
    {MARK_GLYPH}
    <circle cx="404" cy="108" r="36" fill="{AMBER}" stroke="{INK}" stroke-width="12"/>
  </g>
  <rect x="0.5" y="0.5" width="111" height="111" rx="25.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.14"/>
</g>
<g fill="{foreground}">{word_paths}</g>
<g fill="{muted}">{descriptor_paths}</g>
</svg>
"""


def write(name: str, content: str) -> None:
    (OUT / name).write_text(content, encoding="utf-8")
    print(f"  {name}")


def font_css() -> None:
    """Self-contained @font-face CSS for the HTML design boards."""

    geist = base64.b64encode((ROOT / "fonts" / "Geist-Variable.ttf").read_bytes()).decode()
    serif = base64.b64encode(
        (ROOT / "fonts" / "InstrumentSerif-Italic.ttf").read_bytes()
    ).decode()

    css = f"""/* Generated by build_brand.py — do not edit by hand. */
@font-face {{
  font-family: "Geist";
  src: url(data:font/ttf;base64,{geist}) format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}}
@font-face {{
  font-family: "Instrument Serif";
  src: url(data:font/ttf;base64,{serif}) format("truetype");
  font-weight: 400;
  font-style: italic;
  font-display: block;
}}
"""
    (ROOT / "design" / "fonts.css").write_text(css, encoding="utf-8")
    print("  design/fonts.css")


def main() -> None:
    print("Building brand assets...")
    write("lms-mark.svg", mark_svg())
    write("lms-mark-square.svg", mark_svg(radius=0))
    write("lms-mark-mono.svg", mono_svg())
    write("lms-logo-light.svg", lockup_svg(dark=False))
    write("lms-logo-dark.svg", lockup_svg(dark=True))
    font_css()
    print(f"Done -> {OUT}")


if __name__ == "__main__":
    main()
