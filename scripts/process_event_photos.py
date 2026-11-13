#!/usr/bin/env python3
"""Pre-build processor for event gallery photos under assets/img/eventos/.

Features:
- Converts .heic/.heif images to .jpg and removes the .heic original.
- Reads EXIF capture date (DateTimeOriginal / DateTime) before stripping.
- Applies EXIF orientation, strips all EXIF/GPS/XMP metadata, and keeps every
  image under 300 KB.
- Generates cached WebP variants (400w, 800w, 1600w bounded by original width)
  and manifest.json under .cache/eventos/<folder>/ keyed by SHA256.
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
    HAS_PILLOW_HEIF = True
except ImportError:
    HAS_PILLOW_HEIF = False

ROOT = Path(__file__).resolve().parent.parent
EVENTOS_DIR = ROOT / "assets" / "img" / "eventos"
CACHE_DIR = ROOT / ".cache" / "eventos"

SUPPORTED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
HEIC_EXTS = {".heic", ".heif"}
VARIANT_WIDTHS = (400, 800, 1600)
MAX_BYTES = 300 * 1024  # 300 KB hard ceiling per image file
MANIFEST_VERSION = 1

EXIF_TAG_DATETIME_ORIGINAL = 36867
EXIF_TAG_DATETIME_DIGITIZED = 36868
EXIF_TAG_DATETIME = 306
EXIF_TAG_ORIENTATION = 274
EXIF_TAG_GPS_INFO = 34853


def extract_exif_info(path: Path) -> tuple[str, bool, bool]:
    """Return (exif_date_iso, has_sensitive_metadata, needs_transpose)."""
    exif_date = ""
    has_meta = False
    needs_transpose = False

    try:
        with Image.open(path) as img:
            exif = img.getexif()
            if exif and len(exif) > 0:
                has_meta = True
                orientation = exif.get(EXIF_TAG_ORIENTATION, 1)
                if orientation and orientation != 1:
                    needs_transpose = True

                raw_dt = (
                    exif.get(EXIF_TAG_DATETIME_ORIGINAL)
                    or exif.get(EXIF_TAG_DATETIME_DIGITIZED)
                    or exif.get(EXIF_TAG_DATETIME)
                )
                if not raw_dt and hasattr(exif, "get_ifd"):
                    try:
                        exif_ifd = exif.get_ifd(0x8769)
                        raw_dt = exif_ifd.get(EXIF_TAG_DATETIME_ORIGINAL) or exif_ifd.get(
                            EXIF_TAG_DATETIME_DIGITIZED
                        )
                    except Exception:
                        pass
                if raw_dt:
                    exif_date = normalize_exif_date(str(raw_dt))

            for key in ("exif", "xmp", "XML:com.adobe.xmp", "photoshop", "iptc", "comment"):
                if key in img.info:
                    has_meta = True
            if hasattr(img, "applist"):
                for marker, _ in img.applist:
                    if marker not in ("APP0", "APP2"):
                        has_meta = True
    except Exception:
        pass

    if not exif_date and shutil.which("magick"):
        try:
            proc = subprocess.run(
                [
                    "magick",
                    "identify",
                    "-format",
                    "%[EXIF:DateTimeOriginal]|%[EXIF:DateTime]|%[EXIF:GPSLatitude]",
                    str(path),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            if proc.returncode == 0 and proc.stdout:
                parts = proc.stdout.strip().split("|")
                for candidate in parts[:2]:
                    if candidate:
                        exif_date = normalize_exif_date(candidate)
                        if exif_date:
                            break
                if any(parts):
                    has_meta = True
        except Exception:
            pass

    return exif_date, has_meta, needs_transpose


def normalize_exif_date(raw: str) -> str:
    """Convert EXIF 'YYYY:MM:DD HH:MM:SS' into 'YYYY-MM-DD HH:MM:SS'."""
    cleaned = raw.strip()
    m = re.match(r"^(\d{4})[:\-](\d{2})[:\-](\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?", cleaned)
    if not m:
        return ""
    date_part = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    time_part = m.group(4) or "00:00:00"
    return f"{date_part} {time_part}"


def unique_target_jpg(heic_path: Path) -> Path:
    candidate = heic_path.with_suffix(".jpg")
    if not candidate.exists():
        return candidate
    idx = 1
    while True:
        alt = heic_path.with_name(f"{heic_path.stem}_{idx}.jpg")
        if not alt.exists():
            return alt
        idx += 1


def convert_heic_to_jpg(heic_path: Path) -> Path:
    """Convert HEIC/HEIF file to stripped JPEG and delete original."""
    target = unique_target_jpg(heic_path)
    tmp_out = heic_path.with_name(f".__tmp_{heic_path.stem}.jpg")

    try:
        if HAS_PILLOW_HEIF:
            with Image.open(heic_path) as img:
                clean = ImageOps.exif_transpose(img).convert("RGB")
                save_stripped_jpeg_under_limit(clean, tmp_out, max_bytes=MAX_BYTES)
        elif shutil.which("magick"):
            proc = subprocess.run(
                [
                    "magick",
                    str(heic_path),
                    "-auto-orient",
                    "-strip",
                    "-resize",
                    "1600x1600>",
                    "-quality",
                    "82",
                    str(tmp_out),
                ],
                capture_output=True,
                check=False,
            )
            if proc.returncode != 0 or not tmp_out.exists():
                raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore"))
        elif Path("/usr/bin/sips").exists():
            proc = subprocess.run(
                ["/usr/bin/sips", "-s", "format", "jpeg", str(heic_path), "--out", str(tmp_out)],
                capture_output=True,
                check=False,
            )
            if proc.returncode != 0 or not tmp_out.exists():
                raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore"))
        elif shutil.which("heif-convert"):
            proc = subprocess.run(
                ["heif-convert", "-q", "85", str(heic_path), str(tmp_out)],
                capture_output=True,
                check=False,
            )
            if proc.returncode != 0 or not tmp_out.exists():
                raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore"))
        else:
            raise RuntimeError(f"No HEIC converter available for {heic_path}")

        with Image.open(tmp_out) as converted:
            clean = ImageOps.exif_transpose(converted).convert("RGB")
            save_stripped_jpeg_under_limit(clean, target, max_bytes=MAX_BYTES)
    finally:
        if tmp_out.exists():
            tmp_out.unlink()

    heic_path.unlink()
    return target


def strip_pil_image(img: Image.Image) -> Image.Image:
    """Apply EXIF orientation and return a fresh Image without EXIF/GPS/XMP."""
    oriented = ImageOps.exif_transpose(img)
    if oriented.mode in ("RGBA", "LA") or (
        oriented.mode == "P" and "transparency" in oriented.info
    ):
        clean = oriented.convert("RGBA")
    elif oriented.mode != "RGB":
        clean = oriented.convert("RGB")
    else:
        clean = oriented.copy()
    clean.info = {}
    return clean


def save_stripped_jpeg_under_limit(img: Image.Image, dest: Path, max_bytes: int = MAX_BYTES) -> None:
    rgb = img.convert("RGB")
    max_dims = (1600, 1400, 1200, 1000)
    qualities = (84, 78, 72, 65, 58)

    for max_dim in max_dims:
        candidate = rgb.copy()
        if max(candidate.size) > max_dim:
            candidate.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        for q in qualities:
            buf = io.BytesIO()
            candidate.save(buf, format="JPEG", quality=q, optimize=True, progressive=True)
            data = buf.getvalue()
            if len(data) <= max_bytes or (max_dim == max_dims[-1] and q == qualities[-1]):
                dest.write_bytes(data)
                return


def save_stripped_image_under_limit(img: Image.Image, dest: Path, max_bytes: int = MAX_BYTES) -> None:
    ext = dest.suffix.lower()
    if ext in (".jpg", ".jpeg"):
        save_stripped_jpeg_under_limit(img, dest, max_bytes=max_bytes)
        return

    if ext == ".webp":
        save_webp_under_limit(img, dest, max_bytes=max_bytes)
        return

    # PNG (preserve alpha when present)
    work = img.copy()
    for max_dim in (1600, 1280, 1024, 800):
        candidate = work.copy()
        if max(candidate.size) > max_dim:
            candidate.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        candidate.save(buf, format="PNG", optimize=True)
        data = buf.getvalue()
        if len(data) <= max_bytes or max_dim == 800:
            dest.write_bytes(data)
            return


def save_webp_under_limit(img: Image.Image, dest: Path, max_bytes: int = MAX_BYTES) -> None:
    qualities = (80, 74, 68, 60)
    for q in qualities:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=q, method=6)
        data = buf.getvalue()
        if len(data) <= max_bytes or q == qualities[-1]:
            dest.write_bytes(data)
            return


def compute_dominant_color(img: Image.Image) -> str:
    tiny = img.convert("RGB").resize((1, 1), Image.Resampling.BILINEAR)
    r, g, b = tiny.getpixel((0, 0))
    return f"#{r:02x}{g:02x}{b:02x}"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def process_folder(folder_dir: Path) -> dict[str, Any]:
    folder_name = folder_dir.name
    cache_folder = CACHE_DIR / folder_name
    manifest_path = cache_folder / "manifest.json"

    prev_entries: dict[str, dict[str, Any]] = {}
    if manifest_path.exists():
        try:
            prev_data = json.loads(manifest_path.read_text(encoding="utf-8"))
            if prev_data.get("version") == MANIFEST_VERSION:
                for item in prev_data.get("photos", []):
                    prev_entries[item["filename"]] = item
        except Exception:
            prev_entries = {}

    raw_files = sorted(
        p
        for p in folder_dir.iterdir()
        if p.is_file() and not p.name.startswith(".") and p.suffix.lower() in SUPPORTED_EXTS
    )

    pending_dates: dict[str, str] = {}
    converted_paths: list[Path] = []
    for fpath in raw_files:
        if fpath.suffix.lower() in HEIC_EXTS:
            exif_date, _, _ = extract_exif_info(fpath)
            new_jpg = convert_heic_to_jpg(fpath)
            if exif_date:
                pending_dates[new_jpg.name] = exif_date
            converted_paths.append(new_jpg)
        else:
            converted_paths.append(fpath)

    # Deduplicate in deterministic order in case conversion produced a name sorted earlier
    photo_files = sorted(
        {p.name: p for p in converted_paths if p.exists()}.values(),
        key=lambda p: p.name.lower(),
    )

    if not photo_files:
        if cache_folder.exists():
            shutil.rmtree(cache_folder, ignore_errors=True)
        return {"version": MANIFEST_VERSION, "folder": folder_name, "photos": []}

    cache_folder.mkdir(parents=True, exist_ok=True)
    processed_photos: list[dict[str, Any]] = []
    valid_variant_names: set[str] = {"manifest.json"}

    for fpath in photo_files:
        cached = prev_entries.get(fpath.name, {})
        exif_date = pending_dates.get(fpath.name, "")
        disk_exif_date, has_meta, needs_transpose = extract_exif_info(fpath)
        if not exif_date:
            exif_date = disk_exif_date or cached.get("exif_date", "")

        file_size = fpath.stat().st_size
        if has_meta or needs_transpose or file_size > MAX_BYTES:
            with Image.open(fpath) as raw_img:
                clean = strip_pil_image(raw_img)
            save_stripped_image_under_limit(clean, fpath, max_bytes=MAX_BYTES)

        current_hash = sha256_file(fpath)
        with Image.open(fpath) as img_check:
            orig_w, orig_h = img_check.size

        target_widths = [w for w in VARIANT_WIDTHS if w <= orig_w]
        if not target_widths:
            target_widths = [orig_w]
        elif orig_w < VARIANT_WIDTHS[-1] and orig_w not in target_widths:
            target_widths.append(orig_w)

        stem = fpath.stem
        expected_variants = [f"{stem}-{w}.webp" for w in target_widths]
        cache_valid = (
            cached.get("sha256") == current_hash
            and cached.get("width") == orig_w
            and cached.get("height") == orig_h
            and all((cache_folder / vn).exists() for vn in expected_variants)
        )

        if cache_valid:
            entry = dict(cached)
            if exif_date and not entry.get("exif_date"):
                entry["exif_date"] = exif_date
            for vn in expected_variants:
                valid_variant_names.add(vn)
            processed_photos.append(entry)
            continue

        with Image.open(fpath) as src_img:
            clean = strip_pil_image(src_img)
            orig_w, orig_h = clean.size
            dominant_color = compute_dominant_color(clean)

            variant_records: list[dict[str, Any]] = []
            srcset_parts: list[str] = []
            for w in target_widths:
                h = max(1, round(orig_h * (w / orig_w)))
                if w == orig_w:
                    resized = clean.copy()
                else:
                    resized = clean.resize((w, h), Image.Resampling.LANCZOS)
                vname = f"{stem}-{w}.webp"
                vpath = cache_folder / vname
                save_webp_under_limit(resized, vpath, max_bytes=MAX_BYTES)
                valid_variant_names.add(vname)
                vurl = f"/assets/img/eventos/{folder_name}/_variants/{vname}"
                variant_records.append({"width": w, "height": h, "name": vname, "url": vurl})
                srcset_parts.append(f"{vurl} {w}w")

        entry = {
            "filename": fpath.name,
            "stem": stem,
            "rel_url": f"/assets/img/eventos/{folder_name}/{fpath.name}",
            "variants_dir": f"/assets/img/eventos/{folder_name}/_variants",
            "width": orig_w,
            "height": orig_h,
            "aspect_ratio": round(orig_w / orig_h, 4) if orig_h else 1.0,
            "dominant_color": dominant_color,
            "exif_date": exif_date,
            "sha256": current_hash,
            "widths": target_widths,
            "variants": variant_records,
            "srcset": ", ".join(srcset_parts),
        }
        processed_photos.append(entry)

    # Clean stale variant files from cache
    for item in cache_folder.iterdir():
        if item.name not in valid_variant_names and item.is_file():
            item.unlink()

    manifest = {
        "version": MANIFEST_VERSION,
        "folder": folder_name,
        "photos": processed_photos,
    }
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return manifest


def main() -> int:
    if not EVENTOS_DIR.exists():
        return 0

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    active_folders: set[str] = set()

    for sub in sorted(EVENTOS_DIR.iterdir()):
        if not sub.is_dir() or sub.name.startswith("."):
            continue
        active_folders.add(sub.name)
        process_folder(sub)

    for cached_sub in list(CACHE_DIR.iterdir()):
        if cached_sub.is_dir() and cached_sub.name not in active_folders:
            shutil.rmtree(cached_sub, ignore_errors=True)

    return 0


if __name__ == "__main__":
    sys.exit(main())
