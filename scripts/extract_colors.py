#!/usr/bin/env python3
"""
Extract dominant colors for all hardcoded images using okmain.
Writes dominantColor: "#rrggbb" into each image object in defaultGalleryData.ts.

Usage:
    cd /Users/matthew/Developer/textsite
    python3 scripts/extract_colors.py

Idempotent: skips images that already have dominantColor set.
Requires: pip3 install okmain requests Pillow
"""

import re, sys, time, io, requests
from PIL import Image
import okmain

DATA_FILE = "src/components/defaultGalleryData.ts"
DELAY = 0.2  # seconds between requests, to be polite to the CDN


def fetch_image(url: str) -> Image.Image:
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")


def get_hex(img: Image.Image) -> str:
    colors = okmain.colors(img)
    return colors[0].to_hex()


def run():
    with open(DATA_FILE, encoding="utf-8") as f:
        content = f.read()

    # Match each image object by its id and link fields
    pattern = re.compile(
        r'\{\s*\n\s*id:\s*"(?P<id>[^"]+)",\s*\n\s*link:\s*"(?P<url>[^"]+)"',
        re.DOTALL
    )

    matches = list(pattern.finditer(content))
    print(f"Found {len(matches)} image objects")

    skipped = 0
    updated = 0
    errors = 0

    for m in matches:
        image_id = m.group("id")
        url = m.group("url")

        # Re-search for this id in current content to check for existing dominantColor
        # (using current content to account for prior insertions shifting positions)
        id_pos = content.find(f'id: "{image_id}"')
        if id_pos == -1:
            continue
        region = content[id_pos:id_pos + 600]
        if "dominantColor" in region:
            skipped += 1
            continue

        print(f"  [{updated + errors + 1}/{len(matches) - skipped}] {image_id[:40]}...", end=" ", flush=True)
        try:
            hex_color = get_hex(fetch_image(url))
            print(hex_color)
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            hex_color = "#e8e8e8"
            errors += 1

        # Insert dominantColor after the link: line
        link_re = re.compile(
            rf'(id:\s*"{re.escape(image_id)}",\s*\n\s*link:\s*"[^"]*")(,\s*\n)',
            re.DOTALL
        )
        content = link_re.sub(
            rf'\1,\n      dominantColor: "{hex_color}"\2',
            content,
            count=1
        )
        updated += 1
        time.sleep(DELAY)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"\nDone — {updated} updated, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    run()
