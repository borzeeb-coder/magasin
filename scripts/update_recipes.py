#!/usr/bin/env python3
"""
update_recipes.py
-----------------
Génère chaque nuit data/recipes.json : la sélection des recettes réellement
« en promo » ce jour, calculée depuis data/promos.json (offres non expirées).

Le catalogue des recettes (RECIPE_DB) et les synonymes d'ingrédients
(ING_ALIASES) sont extraits de index.html — source unique de vérité de
l'app — pour que le calcul nocturne colle exactement au matching de l'app
(fonction matchesIng : sous-chaîne du nom d'offre + synonymes).

Résultat :
  {
    "generated_at": "…",
    "week": 39,                      // semaine ISO du prospectus courant
    "active": ["pates-bolognaise",…],// recettes avec ≥1 ingrédient en promo
    "top": "…",                      // triées par couverture promo décroissante
    "counts": {"id": n}              // n ingrédients en promo par recette
  }

L'app charge ce fichier au démarrage et relègue en bas de la grille les
recettes absentes de `active` (plus aucune promo cette semaine), comme le
prospectus retire les promos expirées.
"""

import json
import math
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Console (surtout Windows) en UTF-8 pour afficher les emojis sans crash
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

BASE = Path(__file__).resolve().parent.parent
INDEX = BASE / 'index.html'
PROMOS = BASE / 'data' / 'promos.json'
OUT = BASE / 'data' / 'recipes.json'


def extract_block(src: str, marker_start: str, marker_end: str) -> str:
    i = src.find(marker_start)
    if i < 0:
        raise RuntimeError(f'marqueur introuvable : {marker_start}')
    j = src.find(marker_end, i)
    if j < 0:
        raise RuntimeError(f'fin de bloc introuvable : {marker_end}')
    return src[i + len(marker_start):j]


def parse_aliases(block: str) -> dict:
    """Clé = ingrédient canonique → liste de mots-clés (miroir de ING_ALIASES)."""
    aliases = {}
    for m in re.finditer(r'"([^"]+)"\s*:\s*\[([^\]]*)\]', block):
        key = m.group(1)
        vals = [v.strip().strip('"') for v in m.group(2).split(',') if v.strip()]
        aliases[key] = vals
    return aliases


def parse_recipe_db(block: str) -> dict:
    """Miroir de RECIPE_DB (100 recettes, une entrée par ligne dans index.html).
    En cas d'id dupliqué, la dernière entrée gagne — comme en JavaScript."""
    recipes = {}
    pattern = (r'"([a-z0-9-]+)"\s*:\s*\{name:"(.*?)",\s*emoji:"(.*?)",\s*image:"(.*?)",'
               r'\s*servings:(\d+),\s*time:(\d+),\s*ingredients:\[([^\]]*)\]')
    for m in re.finditer(pattern, block, re.S):
        rid = m.group(1)
        ings = [v.strip().strip('"') for v in m.group(7).split(',') if v.strip()]
        recipes[rid] = {
            'name': m.group(2),
            'emoji': m.group(3),
            'image': m.group(4),
            'servings': int(m.group(5)),
            'time': int(m.group(6)),
            'ingredients': ings,
        }
    return recipes


def matches_ing(ing: str, aliases: dict, raw_name: str) -> bool:
    """Portage exact de matchesIng() de l'app."""
    name = (raw_name or '').lower()
    first = name.split(' ')[0] if name else ''
    kws = [ing] + aliases.get(ing.lower().strip(), [])
    return any(kw.lower() in name or first in kw.lower() for kw in kws)


def iso_week_of(dt: datetime) -> int:
    """Portage exact de isoWeekOf() de l'app (calcul JS getDay, dimanche=0)."""
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    start = datetime(dt.year, 1, 1)
    return math.ceil((((dt - start).days + ((dt.weekday() + 1) % 7) + 1) / 7))


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def is_on_offer(offer: dict, grace: str) -> bool:
    """Une offre reste visible si pas de valid_until ou si elle n'est pas
    passée. Même marge de 2 jours que la purge du job nocturne : le folder
    hebdomadaire se termine la veille du jour de rotation (ex. « du 15 au
    21/09 » scruté le 22/09) — sans cette marge on viderait l'enseigne."""
    vu = offer.get('valid_until')
    if vu and str(vu) < grace:
        return False
    return True


def main() -> int:
    if not INDEX.exists():
        print(f'❌ index.html introuvable : {INDEX}', file=sys.stderr)
        return 1
    if not PROMOS.exists():
        print(f'❌ promos.json introuvable : {PROMOS} — lancer d\'abord les scrapers', file=sys.stderr)
        return 1

    src = INDEX.read_text(encoding='utf-8')
    db = parse_recipe_db(extract_block(src, 'const RECIPE_DB = {', '};'))
    aliases = parse_aliases(extract_block(src, 'const ING_ALIASES = {', '};'))
    if len(db) < 50:
        print(f'❌ seulement {len(db)} recettes extraites — extraction cassée ?', file=sys.stderr)
        return 1

    promos = json.loads(PROMOS.read_text(encoding='utf-8-sig'))
    grace = (utcnow() - timedelta(days=2)).strftime('%Y-%m-%d')
    offers = [o for slug, items in (promos.get('offers') or {}).items() for o in items
              if is_on_offer(o, grace)]

    # Semaine du prospectus (comme folderPeriod() : date "du-DD-MM-YY" d'une source_url).
    week = None
    for o in offers:
        m = re.search(r'du[_-](\d{1,2})[_-](\d{1,2})[_-](\d{2})', o.get('source_url') or '')
        if m:
            day, month, yy = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= month <= 12 and 1 <= day <= 31:
                try:
                    week = iso_week_of(datetime(2000 + yy, month, day))
                    break
                except ValueError:
                    continue
    if week is None:
        week = iso_week_of(utcnow())

    counts = {}
    for rid, r in db.items():
        matched = 0
        names = [o.get('name', '') for o in offers]
        for ing in r['ingredients']:
            if any(matches_ing(ing, aliases, n) for n in names):
                matched += 1
        counts[rid] = matched

    active = [rid for rid in db if counts[rid] > 0]

    def coverage(rid):
        ings = db[rid]['ingredients']
        return (counts[rid], counts[rid] / max(1, len(ings)))

    active.sort(key=coverage, reverse=True)

    result = {
        'generated_at': utcnow().isoformat() + 'Z',
        'week': week,
        'active': active,
        'top': active,
        'counts': counts,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ data/recipes.json : {len(active)}/{len(db)} recettes actives "
          f"(semaine {week}, {len(offers)} offres non expirées)")
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:  # pragma: no cover - filet de sécurité
        print(f'✗ update_recipes.py impossible : {exc}', file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)