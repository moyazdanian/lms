#!/usr/bin/env python3
"""Build the Codester screenshot gallery from the captured PNGs.

The captures are full-page screenshots from a Next.js development build, so
they contain the Next.js dev badge. Codester expects 3-9 product-only JPG/PNG
screenshots, not browser or desktop chrome. This script:

1. removes the dev badge from every capture;
2. resizes the two 1920px captures to 1366px;
3. crops the top 900px (the product's most useful frame);
4. removes the native scrollbar from the admin sidebar capture;
5. writes the nine upload-ready images and screenshots.zip.

The original captures are never modified.
"""

from __future__ import annotations

import math
import statistics
import sys
import zipfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SCREENSHOTS = ROOT / "marketing" / "codester" / "screenshots"
FINAL = SCREENSHOTS / "final"
ARCHIVE = ROOT / "marketing" / "codester" / "screenshots.zip"
PREVIEW = SCREENSHOTS / "gallery-preview.jpg"

# Codester allows at most 9 screenshots. These cover storefront, checkout,
# student, instructor and admin surfaces.
SELECTION = [
    ("home-page.png", "01-home-page.png"),
    ("course-catalogue.png", "02-course-catalogue.png"),
    ("course-detail.png", "03-course-detail.png"),
    ("checkout.png", "04-checkout.png"),
    ("user-dashboard-certificates.png", "05-student-certificates.png"),
    ("instructor-dashboard.png", "06-instructor-dashboard.png"),
    ("instructor-dashboard-teaching-courses.png", "07-teaching-courses.png"),
    ("instructor-dashboard-create course.png", "08-course-builder.png"),
    ("admin-dashboard.png", "09-admin-dashboard.png"),
]

FRAME_WIDTH = 1366
FRAME_HEIGHT = 900


def components(points: set[tuple[int, int]]) -> list[list[tuple[int, int]]]:
    """Return 8-connected components of a small set of bright pixels."""
    result: list[list[tuple[int, int]]] = []
    while points:
        seed = points.pop()
        stack = [seed]
        component = [seed]
        while stack:
            x, y = stack.pop()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    neighbour = (x + dx, y + dy)
                    if neighbour in points:
                        points.remove(neighbour)
                        stack.append(neighbour)
                        component.append(neighbour)
        result.append(component)
    return result


def dev_badges(image: Image.Image) -> list[tuple[int, int]]:
    """Find the white N strokes of the Next.js dev badge."""
    width, height = image.size
    pixels = image.load()
    points: set[tuple[int, int]] = set()
    for y in range(height):
        for x in range(max(0, width - 60), width):
            r, g, b = pixels[x, y]
            if r > 180 and g > 180 and b > 180:
                points.add((x, y))

    centres: list[tuple[int, int]] = []
    for component in components(points):
        if not 28 <= len(component) <= 50:
            continue
        xs = [point[0] for point in component]
        ys = [point[1] for point in component]
        left, right = min(xs), max(xs)
        top, bottom = min(ys), max(ys)
        if not (8 <= right - left + 1 <= 11 and 8 <= bottom - top + 1 <= 11):
            continue
        if abs((left + right) / 2 - (width - 38)) > 4:
            continue
        centres.append(((left + right) // 2, (top + bottom) // 2))

    return centres


def remove_dev_badge(image: Image.Image, centres: list[tuple[int, int]]) -> None:
    """Fill each badge with the median colour of a ring around it."""
    pixels = image.load()
    width, height = image.size
    for cx, cy in centres:
        ring: list[tuple[int, int, int]] = []
        for radius in range(24, 31):
            for angle in range(0, 360, 5):
                x = round(cx + radius * math.cos(math.radians(angle)))
                y = round(cy + radius * math.sin(math.radians(angle)))
                if 0 <= x < width and 0 <= y < height:
                    ring.append(pixels[x, y][:3])
        if not ring:
            continue
        fill = tuple(round(statistics.median(channel)) for channel in zip(*ring))

        for y in range(max(0, cy - 24), min(height, cy + 25)):
            for x in range(max(0, cx - 24), min(width, cx + 25)):
                distance = math.hypot(x - cx, y - cy)
                if distance <= 19:
                    alpha = 1.0
                elif distance <= 24:
                    alpha = (24 - distance) / 5
                else:
                    continue
                source = pixels[x, y][:3]
                pixels[x, y] = tuple(
                    round(source[channel] * (1 - alpha) + fill[channel] * alpha)
                    for channel in range(3)
                )


def remove_admin_scrollbar(image: Image.Image) -> None:
    """Cover the native sidebar scrollbar captured in the admin screenshot."""
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        background = pixels[300, y][:3]
        for x in range(306, 324):
            pixels[x, y] = background


def repair_instructor_card_edge(image: Image.Image) -> None:
    """Restore the card edge hidden by the badge in the instructor shot.

    The dev badge sits across the right border of the Revenue Overview card.
    A generic median fill flattens both the card and the page margin into one
    dark patch, so rebuild the three vertical zones from unaffected pixels.
    """
    pixels = image.load()
    border_top = pixels[1333, 500][:3]
    border_bottom = pixels[1333, 620][:3]
    border = tuple(round((a + b) / 2) for a, b in zip(border_top, border_bottom))

    for y in range(536, 593):
        inside = pixels[1288, y][:3]
        outside = pixels[1358, y][:3]
        for x in range(1300, 1333):
            pixels[x, y] = inside
        pixels[1333, y] = border
        for x in range(1334, 1361):
            pixels[x, y] = outside


def build() -> None:
    FINAL.mkdir(parents=True, exist_ok=True)
    for stale in FINAL.glob("*.png"):
        stale.unlink()

    for source_name, target_name in SELECTION:
        source = SCREENSHOTS / source_name
        if not source.exists():
            raise SystemExit(f"missing capture: {source}")

        image = Image.open(source).convert("RGB")
        badges = dev_badges(image)
        if badges:
            remove_dev_badge(image, badges)

        if image.width != FRAME_WIDTH:
            image = image.resize(
                (FRAME_WIDTH, round(image.height * FRAME_WIDTH / image.width)),
                Image.LANCZOS,
            )

        target = FINAL / target_name
        cropped = image.crop((0, 0, FRAME_WIDTH, min(FRAME_HEIGHT, image.height)))
        if target_name == "06-instructor-dashboard.png":
            repair_instructor_card_edge(cropped)
        if target_name == "09-admin-dashboard.png":
            remove_admin_scrollbar(cropped)
        cropped.save(target, "PNG", optimize=True)

        remaining = dev_badges(cropped)
        if remaining:
            print(
                f"  warning: {target_name} still has {len(remaining)} dev badge(s)",
                file=sys.stderr,
            )
        print(
            f"  {target_name:32} {cropped.width}x{cropped.height}  "
            f"{target.stat().st_size / 1024:.0f} KB"
        )

    with zipfile.ZipFile(ARCHIVE, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(FINAL.glob("*.png")):
            archive.write(path, path.name)

    # A compact visual index next to the upload ZIP; not part of the ZIP.
    images = [Image.open(FINAL / name).convert("RGB") for _, name in SELECTION]
    columns, cell_width, cell_height = 3, 440, 312
    rows = (len(images) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_width, rows * cell_height), "white")
    from PIL import ImageDraw, ImageFont

    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    draw = ImageDraw.Draw(sheet)
    for index, (image, (_, name)) in enumerate(zip(images, SELECTION)):
        image.thumbnail((cell_width - 14, cell_height - 36), Image.LANCZOS)
        x = (index % columns) * cell_width + (cell_width - image.width) // 2
        y = (index // columns) * cell_height + 6
        sheet.paste(image, (x, y))
        draw.text(
            ((index % columns) * cell_width + 7, (index // columns) * cell_height + cell_height - 26),
            name,
            fill="black",
            font=font,
        )
    sheet.save(PREVIEW, "JPEG", quality=88)

    print(f"\n  gallery: {ARCHIVE} ({ARCHIVE.stat().st_size / 1024:.0f} KB)")
    print(f"  preview: {PREVIEW}")


if __name__ == "__main__":
    build()
