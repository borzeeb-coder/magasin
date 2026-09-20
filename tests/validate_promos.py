#!/usr/bin/env python3
"""Validate data/promos.json: structure, schema, images, freshness, volumes.

Fails (exit 1) if the generated data would break the front-end or if the
schedule degrades silently. Kept dependency-free (stdlib only).

Usage:
    python tests/validate_promos.py                # standalone
    python tests/validate_promos.py --previous <file>   # anti-régression vs fichier committé

Anti-régression : si une enseigne perd plus de 50% de son volume par rapport
au fichier précédent, c'est un problème de scraping — on refuse de committer.
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
    "spar", "intermarche", "action",
}
# Pourcentage maximal de défauts accepté sur le total des offres
MAX_BAD = 0.10

# Volumes minimums réalistes par enseigne (seuils bas : en-dessous,
# c'est que le scrape a échoué ou que le folder n'a presque rien).
# Les vraies valeurs actuelles sont ~2 à 10× plus hautes.
MIN_OFFERS_PER_STORE = {
    "intermarche": 50,
    "aldi": 60,
    "carrefour": 60,
    "delhaize": 100,
    "lidl": 3,
    "colruyt": 80,
    "spar": 3,
    "action": 20,
}
MIN_TOTAL = 350

# Chute maximale acceptée par enseigne face au fichier précédent
MAX_REGRESSION_RATIO = 0.50  # on tolère une perte de 50% max


def fail(msg: str) -> None:
    print(f"❌ {msg}", file=sys.stderr)
    sys.exit(1)


def load_data(path: Path) -> dict:
    if not path.exists():
        fail(f"{path.name} absent")
    return json.loads(path.read_text(encoding="utf-8"))


def check_volumes(offers: dict, label: str) -> int:
    """Retourne le total d'offres. Échoue si volume global insuffisant."""
    total = 0
    for slug, items in offers.items():
        total += len(items)
        if slug not in MIN_OFFERS_PER_STORE:
            continue
        if len(items) < MIN_OFFERS_PER_STORE[slug]:
            fail(f"[{label}] {slug}: {len(items)} offres < minimum "
                 f"{MIN_OFFERS_PER_STORE[slug]} — scraping probablement échoué")
    if total < MIN_TOTAL:
        fail(f"[{label}] total {total} offres < minimum {MIN_TOTAL}")
    return total


def check_regression(current: dict, previous: dict) -> None:
    """Refuse si une enseigne perd > MAX_REGRESSION_RATIO de son volume."""
    prev_offers = previous.get("offers", {})
    if not prev_offers:
        return  # pas de référence → on se fie aux minimums
    for slug, prev_items in prev_offers.items():
        prev_n = len(prev_items)
        cur_items = (current.get("offers", {}) or {}).get(slug, [])
        cur_n = len(cur_items)
        if prev_n < 10:
            continue  # petite enseigne : variations normales
        if cur_n < prev_n * (1 - MAX_REGRESSION_RATIO):
            fail(f"{slug} : {cur_n} offres vs {prev_n} précédemment "
                 f"(perte > {MAX_REGRESSION_RATIO:.0%}) — refus de committer une régression")


def main() -> int:
    data = load_data(DATA_PATH)

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
        # Certaines enseignes (ex. action) n'ont pas de métadonnées : tolérées à
        # condition d'être connues.
        allowed_extra = {s for s in offers if s not in stores and s in KNOWN_STORES}
        unexpected = unknown_stores - allowed_extra
        if unexpected:
            fail(f"enseignes dans offers sans métadonnées ni référence : {unexpected}")
        print(f"ℹ️  enseignes sans stores_meta mais connues : {allowed_extra}")

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

    # Volumes minimums + anti-régression vs la version committée
    check_volumes(offers, "nouveau")
    prev_arg = None
    if "--previous" in sys.argv:
        i = sys.argv.index("--previous")
        if i + 1 < len(sys.argv):
            prev_arg = Path(sys.argv[i + 1])
    if prev_arg:
        previous = load_data(prev_arg)
        check_regression(data, previous)

    print(f"✅ promos.json OK : {total} offres, {len(stores)} enseignes, {age_days:.1f} j d'âge")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # pragma: no cover - filet de secours
        fail(f"validation impossible : {exc}")