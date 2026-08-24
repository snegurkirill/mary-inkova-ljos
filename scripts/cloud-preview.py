#!/usr/bin/env python3
"""
cloud-preview.py — combine a folder of artwork photos into a single "photo
cloud" preview image: images scattered like prints laid out on a table —
organic, non-grid positions, never overlapping, no rotation, no shadow — on
a solid neutral background. Used for a Project's Gallery-card cover.

Algorithm (word-cloud style spiral packing)
--------------------------------------------
The classic technique word-cloud generators (d3-cloud, wordcloud2.js) use to
pack many rectangles into an organic, non-overlapping cluster: for each
image (largest first), try placing it at the cluster's center; if it
collides with anything already placed, walk it outward along a spiral
(slightly wider than tall, so the cluster grows into the target card's
aspect ratio rather than a perfect circle) until it lands on a free spot.
No rows, no grid — the cloud shape falls out of the packing itself.

Tile sizes are each image's own pixel dimensions scaled by one shared factor
(auto-picked, by default, to land the median tile around --target-height) —
not randomized per tile — so a photo that's naturally larger than the others
stays visibly larger in the cloud, instead of every tile being normalized to
an arbitrary size band.

Usage
-----
    python3 scripts/cloud-preview.py <input_dir> <output_path> [options]

Example
-------
    python3 scripts/cloud-preview.py "Фото/Пример галереи" preview.png \\
        --target-height 160 --gap 6
"""
import argparse
import glob
import math
import os
import random
import sys

from PIL import Image


def load_images(input_dir):
    exts = ("*.jpg", "*.jpeg", "*.png", "*.webp")
    paths = []
    for e in exts:
        paths.extend(glob.glob(os.path.join(input_dir, e)))
        paths.extend(glob.glob(os.path.join(input_dir, e.upper())))
    paths = sorted(set(paths))
    if not paths:
        sys.exit(f"No images found in {input_dir!r}")
    images = []
    for p in paths:
        with Image.open(p) as im:
            im = im.convert("RGB")
            images.append({"path": p, "w": im.width, "h": im.height, "im": im.copy()})
    return images


def pick_scale(images, target_height):
    """One shared scale factor for every tile, picked so the median image's
    height lands on target_height — preserves each photo's size *relative*
    to the others (their real pixel dimensions), rather than normalizing
    every tile to its own independent random size."""
    heights = sorted(img["h"] for img in images)
    median_h = heights[len(heights) // 2]
    return target_height / median_h


def overlaps(x, y, w, h, placed, gap):
    """AABB collision check, with `gap` as required clearance on all sides."""
    for _, px, py, pw, ph in placed:
        if (
            x - gap < px + pw
            and x + w + gap > px
            and y - gap < py + ph
            and y + h + gap > py
        ):
            return True
    return False


def spiral_pack(images, scale, gap, aspect, rng):
    """Place every image via spiral search from the cluster center. Larger
    tiles first, so the biggest images anchor the cluster and smaller ones
    fill the gaps around them — the same ordering word-cloud packers use."""
    sized = [(img, img["w"] * scale, img["h"] * scale) for img in images]
    sized.sort(key=lambda t: t[1] * t[2], reverse=True)  # area, largest first

    placed = []
    cx, cy = 0.0, 0.0
    for img, w, h in sized:
        theta = rng.uniform(0, 2 * math.pi)
        radius = 0.0
        dtheta = 0.28
        dradius = 3.0
        while True:
            x = cx + radius * aspect * math.cos(theta) - w / 2
            y = cy + radius * math.sin(theta) - h / 2
            if not overlaps(x, y, w, h, placed, gap):
                placed.append((img, x, y, w, h))
                break
            theta += dtheta
            radius += dradius * (dtheta / (2 * math.pi))  # Archimedean spiral
    return placed


def compose(placed, bg, margin):
    min_x = min(x for _, x, y, w, h in placed)
    min_y = min(y for _, x, y, w, h in placed)
    max_x = max(x + w for _, x, y, w, h in placed)
    max_y = max(y + h for _, x, y, w, h in placed)
    canvas_w = int(max_x - min_x + margin * 2)
    canvas_h = int(max_y - min_y + margin * 2)
    canvas = Image.new("RGB", (canvas_w, canvas_h), bg)
    for img, x, y, w, h in placed:
        tile = img["im"].resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)
        px = round(x - min_x + margin)
        py = round(y - min_y + margin)
        canvas.paste(tile, (px, py))
    return canvas


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input_dir")
    ap.add_argument("output_path")
    ap.add_argument("--target-height", type=float, default=160, help="scale so the median tile lands around this height (px); ignored if --scale is given")
    ap.add_argument("--scale", type=float, default=None, help="explicit shared scale factor applied to every image's own pixel size, overrides --target-height")
    ap.add_argument("--gap", type=float, default=6, help="minimum clearance between tiles")
    ap.add_argument("--margin", type=float, default=40)
    ap.add_argument("--aspect", type=float, default=1.38, help="cluster width:height bias (1280/925 by default, matching the Gallery card)")
    ap.add_argument("--bg", default="#f5f5f5")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--quality", type=int, default=90, help="JPEG/WebP quality")
    args = ap.parse_args()

    rng = random.Random(args.seed)
    images = load_images(args.input_dir)
    scale = args.scale if args.scale is not None else pick_scale(images, args.target_height)

    placed = spiral_pack(images, scale, args.gap, args.aspect, rng)
    canvas = compose(placed, args.bg, args.margin)

    ext = os.path.splitext(args.output_path)[1].lower()
    save_kwargs = {}
    if ext in (".jpg", ".jpeg", ".webp"):
        save_kwargs = {"quality": args.quality}
    canvas.save(args.output_path, **save_kwargs)
    print(f"{len(images)} images, scale={scale:.3f} -> {canvas.width}x{canvas.height} {args.output_path}")


if __name__ == "__main__":
    main()
