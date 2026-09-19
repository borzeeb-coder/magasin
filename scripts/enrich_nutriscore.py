#!/usr/bin/env python3
"""Enrich promos.json with Nutri-Score data from OpenFoodFacts.

For each offer without a nutri-score:
1. If the offer already carries an EAN (e.g. Colruyt barcode) -> use it directly.
2. Else check data/ean_mapping.json (name -> EAN).
3. Else search OpenFoodFacts by product name (multiple variants).

Results are cached in data/nutri_cache.json to avoid re-fetching between runs.
"""

import json
import re
import sys
import time
import requests
from pathlib import Path
from urllib.parse import quote

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
PROMOS_FILE = DATA_DIR / 'promos.json'
MAPPING_FILE = DATA_DIR / 'ean_mapping.json'
CACHE_FILE = DATA_DIR / 'nutri_cache.json'

UA = {'User-Agent': 'MagasinPromos/1.0 (contact: github.com/borzeeb-coder/magasin)'}

NUTRI_FIELDS = [
    'nutriscore', 'nova_group', 'nutrition', 'ingredients', 'allergens',
    'additives', 'labels', 'brands', 'categories',
]

# Products that never get a Nutri-Score (fresh meat/fish, alcohol, etc.)
NO_NUTRISCORE_KEYWORDS = [
    'alcool', 'vin ', 'bière', 'biere', 'spiritueux', 'whisky', 'vodka', 'rhum',
    'champagne', 'liqueur', 'pils ', ' trappist', 'frais_viande', 'viande fraîche',
    'steak haché', 'poulet entier', ' filet ', 'escalope', 'brochette',
    'poisson frais', 'moule', 'crevette', 'saumon frais', 'cabillaud', 'colin',
    'ménage', 'lessive', 'nettoyant', 'détergent', 'shampoing', 'savon',
    'dentifrice', 'déodorant', 'cosmétique', 'maquillage', 'parfum',
    'gel désincrustant', 'eau micellair', 'eau micellaire', 'bloc wc',
    'keratin protect', 'masque', 'mouchoir', ' démaquillant',
]

UNELIGIBLE_TYPES = ['NOT-APPLICABLE', 'UNKNOWN']


def load_json(path):
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def should_skip_nutriscore(name):
    nl = name.lower()
    return any(kw in nl for kw in NO_NUTRISCORE_KEYWORDS)


def clean_name(name):
    """Normalize a store name for search: 'Eau minérale| Non pétill |Bouchon' -> 'Eau minérale Non pétill Bouchon'."""
    n = re.sub(r'\s*[|\/]\s*', ' ', name or '')
    n = re.sub(r'\s+', ' ', n).strip()
    return n


def build_queries(name, brand=''):
    """Build ordered search queries from most to least specific."""
    q = clean_name(name)
    cands = []
    if brand and brand.lower() in q.lower():
        cands.append(q)
    elif brand:
        cands.append(f'{brand} {q}')
    else:
        cands.append(q)
    words = q.split()
    if len(words) > 4:
        for cut in (4, 3, 2):
            cands.append(' '.join(words[:cut]))
    seen = set()
    out = []
    for c in cands:
        lc = c.lower()
        if lc not in seen:
            seen.add(lc)
            out.append(c)
    return out


def search_ean_by_name(name, brand=''):
    """Search OpenFoodFacts for an EAN matching the product name."""
    for query in build_queries(name, brand):
        url = f'https://world.openfoodfacts.org/cgi/search.pl?search_terms={quote(query)}&search_simple=1&action=process&json=1&page_size=5'
        try:
            r = requests.get(url, headers=UA, timeout=20)
            if r.status_code == 200:
                data = r.json()
                for p in data.get('products', []):
                    if p.get('code') and p.get('nutriscore_grade'):
                        return p['code'], p['nutriscore_grade']
        except Exception as e:
            print(f"  search error: {e}")
            return None, None
    return None, None


def fetch_nutri_info(ean):
    """Fetch full nutritional info from OpenFoodFacts by EAN."""
    if not ean:
        return None
    url = f'https://world.openfoodfacts.org/api/v0/product/{ean}.json'
    try:
        r = requests.get(url, headers=UA, timeout=20)
        if r.status_code == 200:
            data = r.json()
            if data.get('status') == 1:
                p = data.get('product', {})
                return {
                    'nutriscore': p.get('nutriscore_grade', '').upper(),
                    'nova_group': p.get('nova_group'),
                    'nutrition': {k: v for k, v in {
                        'energy_kcal_100g': p.get('nutriments', {}).get('energy-kcal_100g'),
                        'fat_100g': p.get('nutriments', {}).get('fat_100g'),
                        'saturated_fat_100g': p.get('nutriments', {}).get('saturated-fat_100g'),
                        'carbs_100g': p.get('nutriments', {}).get('carbohydrates_100g'),
                        'sugars_100g': p.get('nutriments', {}).get('sugars_100g'),
                        'fiber_100g': p.get('nutriments', {}).get('fiber_100g'),
                        'proteins_100g': p.get('nutriments', {}).get('proteins_100g'),
                        'salt_100g': p.get('nutriments', {}).get('salt_100g'),
                    }.items() if v is not None},
                    'ingredients': p.get('ingredients_text_fr', ''),
                    'allergens': p.get('allergens_hierarchy', []),
                    'additives': p.get('additives_tags', []),
                    'labels': p.get('labels_tags', []),
                    'brands': p.get('brands', ''),
                    'categories': p.get('categories', ''),
                }
    except Exception as e:
        print(f"  fetch error: {e}")
    return None


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print("=== Nutri-Score enrichment started ===")

    promos = load_json(PROMOS_FILE)
    if not promos.get('offers'):
        print("No offers found")
        return

    cache = load_json(CACHE_FILE)

    mapping = load_json(MAPPING_FILE)
    mappings = mapping.get('mappings', {})

    total = 0
    enriched_new = 0
    already = 0
    skipped = 0
    not_found = 0
    processed = 0

    for store, offers in promos['offers'].items():
        store_map = mappings.get(store, {})
        for offer in offers:
            total += 1
            if offer.get('nutriscore'):
                already += 1
                continue

            name = offer.get('name', '')
            brand = offer.get('brand', '')

            if should_skip_nutriscore(name):
                skipped += 1
                continue

            ean = offer.get('ean')
            if not ean:
                ean = store_map.get(name)

            key = ean or f'{store}|{name}'
            cache_name_key = f'{store}|{name}'

            # cached result? (by ean or by name)
            cached = cache.get(cache_name_key)
            if cached is None and ean:
                cached = cache.get(ean)

            if cached is not None:
                offer.update({k: cached.get(k) for k in NUTRI_FIELDS if cached.get(k) is not None})
                if offer.get('ean') is None and ean:
                    offer['ean'] = ean
                enriched_new += 1
                print(f"  [{store}] {name[:45]:<45} -> {offer.get('nutriscore', '?')}")
                continue
            elif ean in cache or cache_name_key in cache:
                # previously looked up and failed against this ean/name
                if ean and cache_name_key not in cache:
                    pass
                else:
                    not_found += 1
                    continue

            nutri = None
            if ean:
                nutri = fetch_nutri_info(ean)
            if nutri is None:
                # Fallback: search by name (EAN may be an internal/broken code)
                found_ean, _ = search_ean_by_name(name, brand)
                if found_ean and found_ean != ean:
                    offer['ean'] = found_ean
                    nutri = fetch_nutri_info(found_ean)

            time.sleep(0.3)

            if nutri:
                for k in NUTRI_FIELDS:
                    if nutri.get(k) is not None:
                        offer[k] = nutri[k]
                if offer.get('ean') is None and ean:
                    offer['ean'] = ean
                cache[cache_name_key] = {k: nutri.get(k) for k in NUTRI_FIELDS}
                if offer.get('ean'):
                    cache[offer['ean']] = cache[cache_name_key]
                enriched_new += 1
            else:
                cache[cache_name_key] = None
                not_found += 1

            print(f"  [{store}] {name[:45]:<45} -> {offer.get('nutriscore', '?')}")

            processed += 1
            # progressive save every 50 offers (robust against crashes)
            if processed % 50 == 0:
                save_json(PROMOS_FILE, promos)
                save_json(CACHE_FILE, cache)
                print(f"  [checkpoint] {processed} offers processed, saved.")

    save_json(PROMOS_FILE, promos)
    save_json(CACHE_FILE, cache)

    with_nutri = sum(1 for v in promos['offers'].values() for o in v if o.get('nutriscore'))
    pct = with_nutri / total * 100 if total else 0
    print("\n=== SUMMARY ===")
    print(f"Total offers: {total}")
    print(f"Already had Nutri-Score: {already}")
    print(f"Newly enriched (incl. cache): {enriched_new}")
    print(f"Not found: {not_found}")
    print(f"Skipped (non-eligible): {skipped}")
    print(f"With Nutri-Score now: {with_nutri} ({pct:.1f}%)")
    for store, offers in promos['offers'].items():
        nn = sum(1 for o in offers if o.get('nutriscore'))
        print(f"  {store}: {len(offers)} ({nn} with Nutri-Score)")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)