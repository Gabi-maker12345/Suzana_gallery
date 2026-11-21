#!/usr/bin/env python3
"""Gera miniaturas e o manifesto das fotos em assets/Suzana.

Requer Pillow e, para HEIC, pillow-heif:
    python3 -m pip install pillow pillow-heif
    python3 scripts/build-suzana-assets.py

- Fotos HEIC/HEIF ganham uma versão JPG em assets/Suzana/_web/.
- Todas ganham miniatura em assets/Suzana/_thumbs/.
- js/suzana-assets.js e assets/Suzana/manifest.json são reescritos.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "Suzana"
THUMBS = SRC / "_thumbs"
WEB = SRC / "_web"
MANIFEST_JSON = SRC / "manifest.json"
MANIFEST_JS = ROOT / "js" / "suzana-assets.js"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"}
HEIC_EXTS = {".heic", ".heif"}
CREAM = (247, 241, 236)


def flatten(image: Image.Image) -> Image.Image:
    if image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    ):
        rgba = image.convert("RGBA")
        canvas = Image.new("RGB", rgba.size, CREAM)
        canvas.paste(rgba, mask=rgba.getchannel("A"))
        return canvas
    return image.convert("RGB")


def build_one(source: Path) -> dict | None:
    name = source.name
    stem = source.stem
    suffix = source.suffix.lower()
    try:
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened)
            image.load()
            width, height = image.size

            thumb = image.copy()
            thumb.thumbnail((400, 400), Image.Resampling.LANCZOS)
            thumb = flatten(thumb)
            thumb_path = THUMBS / f"{stem}.jpg"
            thumb.save(thumb_path, "JPEG", quality=82, optimize=True)

            src = source
            if suffix in HEIC_EXTS:
                web_path = WEB / f"{stem}.jpg"
                flatten(image).save(web_path, "JPEG", quality=88, optimize=True)
                src = web_path

        return {
            "name": name,
            "src": src.relative_to(ROOT).as_posix(),
            "thumb": thumb_path.relative_to(ROOT).as_posix(),
            "w": width,
            "h": height,
        }
    except Exception as error:  # noqa: BLE001 - relatar e seguir
        print(f"FALHOU {name}: {error}")
        return None


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Pasta não encontrada: {SRC}")
    THUMBS.mkdir(parents=True, exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)

    sources = sorted(
        (p for p in SRC.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS),
        key=lambda p: p.name.lower(),
    )
    print(f"{len(sources)} fotos encontradas em {SRC}")

    entries: list[dict] = []
    for source in sources:
        if source.suffix.lower() in HEIC_EXTS and pillow_heif is None:
            print(f"FALHOU {source.name}: pillow-heif não instalado.")
            continue
        entry = build_one(source)
        if entry:
            entries.append(entry)

    entries.sort(key=lambda item: item["name"].lower())
    MANIFEST_JSON.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    MANIFEST_JS.write_text(
        "/* Gerado por scripts/build-suzana-assets.py — não editar à mão. */\n"
        "window.SUZANA_ASSETS = "
        + json.dumps(entries, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    heic = sum(1 for e in entries if e["name"].lower().endswith((".heic", ".heif")))
    print(f"{len(entries)} entradas no manifesto ({heic} HEIC convertidos).")
    print(f"Miniaturas: {THUMBS}")
    print(f"JPGs web:   {WEB}")
    print(f"Manifesto:  {MANIFEST_JS}")


if __name__ == "__main__":
    main()
