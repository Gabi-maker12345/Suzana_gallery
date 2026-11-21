#!/usr/bin/env python3
"""Valida o export de categorias e gera o seed da galeria + relatório.

Lê:
    assets/suzana-categorias.json
    assets/Suzana/manifest.json

Gera:
    js/categorias.seed.js
    data/categorias-validacao.md
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORT = ROOT / "assets" / "suzana-categorias.json"
MANIFEST = ROOT / "assets" / "Suzana" / "manifest.json"
SEED = ROOT / "js" / "categorias.seed.js"
REPORT = ROOT / "data" / "categorias-validacao.md"


def main() -> None:
    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_name = {item["name"]: item for item in manifest}
    categories = export.get("categories", [])

    all_photos = [photo for cat in categories for photo in cat.get("photos", [])]
    counts = Counter(all_photos)
    repeated = {
        name: [
            {"category": cat["name"], "position": cat["photos"].index(name) + 1}
            for cat in categories
            if name in cat.get("photos", [])
        ]
        for name, n in counts.items()
        if n > 1
    }
    unselected = [item["name"] for item in manifest if item["name"] not in counts]
    missing = sorted({name for name in counts if name not in by_name})
    missing_files = []
    for name in counts:
        item = by_name.get(name)
        if not item:
            continue
        for key in ("src", "thumb"):
            if not (ROOT / item[key]).is_file():
                missing_files.append((name, key, item[key]))

    lines: list[str] = []
    lines.append("# Categorias verificadas")
    lines.append("")
    lines.append(f"Exportado em `{export.get('exportedAt', '—')}`.")
    lines.append("")
    lines.append("## Resumo")
    lines.append("")
    lines.append("| Categoria | Fotos |")
    lines.append("| --- | ---: |")
    for cat in categories:
        lines.append(f"| {cat['name']} | {len(cat.get('photos', []))} |")
    lines.append(f"| **Total** | **{len(all_photos)}** |")
    lines.append("")
    lines.append(f"- Categorias: **{len(categories)}**")
    lines.append(f"- Posições de foto: **{len(all_photos)}**")
    lines.append(f"- Fotos únicas: **{len(counts)}**")
    lines.append(f"- Repetidas entre categorias: **{len(repeated)}**")
    lines.append(f"- Fotos do manifesto não usadas: **{len(unselected)}**")
    lines.append(f"- Nomes ausentes no manifesto: **{len(missing)}**")
    lines.append(f"- Arquivos src/thumb ausentes: **{len(missing_files)}**")
    lines.append("")

    if repeated:
        lines.append("## Repetidas entre categorias")
        lines.append("")
        for name, occurrences in sorted(repeated.items()):
            places = ", ".join(f"{o['category']} (posição {o['position']})" for o in occurrences)
            lines.append(f"- `{name}` — {places}")
        lines.append("")

    if missing:
        lines.append("## Nomes ausentes no manifesto")
        lines.append("")
        for name in missing:
            lines.append(f"- `{name}`")
        lines.append("")

    if missing_files:
        lines.append("## Arquivos ausentes")
        lines.append("")
        for name, key, path in missing_files:
            lines.append(f"- `{name}` — {key}: `{path}`")
        lines.append("")

    lines.append("## Ordem por categoria")
    for cat in categories:
        photos = cat.get("photos", [])
        heic = sum(1 for name in photos if name.lower().endswith((".heic", ".heif")))
        lines.append("")
        lines.append(f"### {cat['name']} — {len(photos)} foto{'s' if len(photos) != 1 else ''}")
        lines.append("")
        if cat.get("description"):
            lines.append(f"> {cat['description']}")
            lines.append("")
        if heic:
            lines.append(f"_Inclui {heic} HEIC convertido{'s' if heic != 1 else ''} para JPG web._")
            lines.append("")
        for position, name in enumerate(photos, start=1):
            item = by_name.get(name)
            src = item["src"] if item else "AUSENTE"
            lines.append(f"{position:02d}. `{name}` — `{src}`")
    lines.append("")

    if unselected:
        lines.append("## Fotos do manifesto fora das categorias")
        lines.append("")
        for name in unselected:
            lines.append(f"- `{name}`")
        lines.append("")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines), encoding="utf-8")

    SEED.write_text(
        "/* Gerado por scripts/build-categories-seed.py — não editar à mão. */\n"
        "window.SUZANA_CATEGORIES = "
        + json.dumps(categories, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    print(f"{len(categories)} categorias, {len(all_photos)} posições, {len(counts)} únicas")
    print(f"Repetidas entre categorias: {len(repeated)}")
    print(f"Faltando no manifesto: {len(missing)} | arquivos ausentes: {len(missing_files)}")
    print(f"Relatório: {REPORT.relative_to(ROOT)}")
    print(f"Seed:      {SEED.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
