#!/usr/bin/env python3
"""Validate data/promos.json: structure, schema, images, freshness.

Fails (exit 1) if the generated data would break the front-end or if the
schedule degrades silently. Kept dependency-free (stdlib only).
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Console (surtout Windows) en UTF-8 pour afficher les emojis sans crash
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "promos.json"
KNOWN_STORES = {
    "colruyt", "delhaize", "carrefour", "lidl", "aldi",
    "spar", "intermarche",
}
# Pourcentage maximal de défauts accepté sur le total des offres
MAX_BAD = 0.10


def fail(msg: str) -> None:
    print(f"❌ {msg}", file=sys.stderr)
    sys.exit(1)


def main() -> int:
    if not DATA_PATH.exists():
        fail("data/promos.json absent — lancer d'abord scrape_promos.py")

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    if not isinstance(data, dict):
        fail("promos.json doit être un objet racine")
    if "generated_at" not in data:
        fail("champ generated_at manquant")

    # Fraîcheur : le bot tourne chaque nuit, on tolère 3 jours.
    try:
        gen = datetime.fromisoformat(data["generated_at"].replace("Z", "+00:00"))
    except ValueError:
        fail(f"generated_at illisible : {data['generated_at']!r}")
    age_days = (datetime.now(timezone.utc) - gen).total_seconds() / 86400
    if age_days > 3:
        fail(f"données trop anciennes ({age_days:.1f} j) — le workflow nocturne semble en panne")

    offers = data.get("offers", {})
    stores = data.get("stores_meta", {})
    unknown_stores = set(offers) - set(stores)
    if unknown_stores:
        fail(f"enseignes dans offers sans métadonnées : {unknown_stores}")

    total = 0
    bad = 0
    for slug, items in offers.items():
        if slug not in KNOWN_STORES:
            fail(f"enseigne inconnue : {slug}")
        for item in items:
            total += 1
            if not isinstance(item, dict) or not item.get("name"):
                bad += 1
                continue
            if not item.get("source_url"):
                bad += 1
            img = item.get("image_url") or ""
            if img.startswith("data/images/"):
                if not (ROOT / img).exists():
                    bad += 1
            elif not img.startswith("http"):
                bad += 1

    if total == 0:
        fail("aucune offre récupérée — le scraper a probablement échoué")
    if bad / total > MAX_BAD:
        fail(f"{bad}/{total} offres invalides (> {MAX_BAD:.0%})")

    print(f"✅ promos.json OK : {total} offres, {len(stores)} enseignes, {age_days:.1f} j d'âge")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # pragma: no cover - filet de secours
        fail(f"validation impossible : {exc}")