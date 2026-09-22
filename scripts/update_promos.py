#!/usr/bin/env python3
"""
Auto-update promos from APIs and websites
- Fetches Intermarche from API
- Scrapes other stores from websites
- Downloads images
- Fetches Nutri-Score from OpenFoodFacts
- Removes expired promos
- Updates promos.json
"""

import json, requests, os, sys, time, hashlib
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin, quote

# Import scrapers
sys.path.insert(0, str(Path(__file__).parent))
from scrapers import STORE_SCRAPERS, folder_period_from_url, parse_validity

UA = {'User-Agent': 'PromoApp/1.0 (https://github.com/borzeeb-coder/magasin)'}
DATA_DIR = Path('data')
IMAGES_DIR = DATA_DIR / 'images'
PROMOS_FILE = DATA_DIR / 'promos.json'
EAN_MAPPING_FILE = DATA_DIR / 'ean_mapping.json'

# Configuration
INTERMARCHE_CONFIG = {
    'api_url': 'https://folders.intermarche.be/.2026-s38fr/publication/contents/templates/wishlistV4/products.json',
    'image_cdn': 'https://fr.zone-secure.net/863887/2701390/',
}

# Catégories sans Nutri-Score
NO_NUTRISCORE_KEYWORDS = [
    'alcool', 'vin', 'bière', 'spiritueux', 'whisky', 'vodka', 'rhum', 'gin',
    'ménage', 'lessive', 'nettoyant', 'détergent', 'assouplissant',
    'hygiène', 'shampoing', 'savon', 'dentifrice', 'déodorant', 'gel douche',
    'cosmétique', 'maquillage', 'crème', 'parfum', 'soin',
    'jouet', 'jeu', 'puzzle', 'album', 'collection',
    'textile', 'literie', 'vêtement', 'chaussette',
    'bricolage', 'outillage', 'quincaillerie',
]

def load_json(path):
    # Les données committées peuvent avoir un BOM UTF-8 (produites par des
    # outils Windows) : utf-8-sig les tolère.
    with open(path, 'r', encoding='utf-8-sig') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def should_skip_nutriscore(name):
    name_lower = name.lower()
    return any(kw in name_lower for kw in NO_NUTRISCORE_KEYWORDS)

def get_ean_from_mapping(store, name, brand=''):
    """Get EAN from local mapping file"""
    if EAN_MAPPING_FILE.exists():
        mapping = load_json(EAN_MAPPING_FILE)
        if store in mapping.get('mappings', {}) and name in mapping['mappings'][store]:
            return mapping['mappings'][store][name]
    return None

def search_openfoodfacts_ean(name, brand=''):
    """Search OpenFoodFacts for product EAN"""
    query = f'{brand} {name}'.strip() if brand else name
    url = f'https://world.openfoodfacts.org/cgi/search.pl?search_terms={quote(query)}&search_simple=1&action=process&json=1&page_size=5'
    
    try:
        r = requests.get(url, headers=UA, timeout=15)
        if r.status_code == 200:
            data = r.json()
            for p in data.get('products', []):
                if p.get('code') and p.get('nutriscore_grade'):
                    return p['code']
    except Exception as e:
        print(f"  OpenFoodFacts search error: {e}")
    return None

def fetch_nutri_info(ean):
    """Fetch full nutritional info from OpenFoodFacts"""
    if not ean:
        return None
    
    url = f'https://world.openfoodfacts.org/api/v0/product/{ean}.json'
    try:
        r = requests.get(url, headers=UA, timeout=15)
        if r.status_code == 200:
            data = r.json()
            if data.get('status') == 1:
                p = data.get('product', {})
                return {
                    'nutriscore': p.get('nutriscore_grade', '').upper(),
                    'nova_group': p.get('nova_group'),
                    'energy_kcal_100g': p.get('nutriments', {}).get('energy-kcal_100g'),
                    'fat_100g': p.get('nutriments', {}).get('fat_100g'),
                    'saturated_fat_100g': p.get('nutriments', {}).get('saturated-fat_100g'),
                    'carbs_100g': p.get('nutriments', {}).get('carbohydrates_100g'),
                    'sugars_100g': p.get('nutriments', {}).get('sugars_100g'),
                    'fiber_100g': p.get('nutriments', {}).get('fiber_100g'),
                    'proteins_100g': p.get('nutriments', {}).get('proteins_100g'),
                    'salt_100g': p.get('nutriments', {}).get('salt_100g'),
                    'ingredients': p.get('ingredients_text_fr', ''),
                    'allergens': p.get('allergens_hierarchy', []),
                    'additives': p.get('additives_tags', []),
                    'labels': p.get('labels_tags', []),
                    'brands': p.get('brands', ''),
                    'categories': p.get('categories', ''),
                }
    except Exception as e:
        print(f"  OpenFoodFacts fetch error: {e}")
    return None

def download_image(url, local_path):
    """Download image with retries"""
    if not url or url.startswith('data:'):
        return False
    for attempt in range(3):
        try:
            r = requests.get(url, headers=UA, timeout=20, stream=True)
            if r.status_code == 200 and len(r.content) > 1000:
                local_path.parent.mkdir(parents=True, exist_ok=True)
                with open(local_path, 'wb') as f:
                    f.write(r.content)
                return True
        except Exception as e:
            print(f"  Download attempt {attempt+1} failed: {e}")
            time.sleep(1)
    return False

def fetch_intermarche():
    """Fetch Intermarche promos from API"""
    print("Fetching Intermarche from API...")
    config = INTERMARCHE_CONFIG
    
    r = requests.get(config['api_url'], headers=UA, timeout=30)
    r.raise_for_status()
    products = r.json()
    
    offers = []
    seen = set()
    
    for p in products:
        name = p.get('Nom produit', '').strip()
        ref = p.get('ref', '')
        if not name or name in seen:
            continue
        seen.add(name)
        
        # Build offer
        promo_text = p.get('promo', '') or p.get('promo_carte', '')
        discount_pct = None
        if '%' in promo_text:
            try:
                discount_pct = int(''.join(filter(str.isdigit, promo_text.split('%')[0].split()[-1])))
            except:
                pass
        
        new_price = None
        if p.get('Prix'):
            try:
                new_price = float(p['Prix'].replace(',', '.'))
            except:
                pass
        
        old_price = None
        if p.get('Prix barré'):
            try:
                old_price = float(p['Prix barré'].replace(',', '.'))
            except:
                pass
        
        img_filename = f"intermarche-{len(offers):03d}.webp"
        img_url = config['image_cdn'] + p.get('images', '')
        
        source_url = 'https://www.intermarche.be/folders/decouvrez-notre-folder-du-15-09-26/'
        valid_from, valid_until = folder_period_from_url(source_url)
        
        offer = {
            'name': name,
            'brand': p.get('groupe filtre', ''),
            'category': p.get('Rayon', ''),
            'description': p.get('Descriptif', '').replace('</br>', ' '),
            'new_price': new_price,
            'old_price': old_price,
            'discount_pct': discount_pct,
            'promo_text': promo_text,
            'unit': p.get('Unite', ''),
            'image_url': f'data/images/{img_filename}',
            'image_filename': img_filename,
            'source_url': source_url,
            'fetched_at': datetime.utcnow().isoformat() + 'Z',
        }
        if valid_until:
            offer['valid_until'] = valid_until
        if valid_from:
            offer['valid_from'] = valid_from
        
        # Download image
        if p.get('images'):
            download_image(img_url, IMAGES_DIR / img_filename)
        
        # Get Nutri-Score
        if not should_skip_nutriscore(name):
            ean = get_ean_from_mapping('intermarche', name) or search_openfoodfacts_ean(name)
            if ean:
                nutri = fetch_nutri_info(ean)
                if nutri and nutri['nutriscore']:
                    offer['nutriscore'] = nutri['nutriscore']
                    offer['nova_group'] = nutri['nova_group']
                    offer['nutrition'] = {k: v for k, v in nutri.items() 
                                        if k in ['energy_kcal_100g', 'fat_100g', 'saturated_fat_100g',
                                                 'carbs_100g', 'sugars_100g', 'fiber_100g',
                                                 'proteins_100g', 'salt_100g']}
                    offer['ingredients'] = nutri['ingredients']
                    offer['allergens'] = nutri['allergens']
                    offer['additives'] = nutri['additives']
                    offer['labels'] = nutri['labels']
                    offer['brands'] = nutri['brands']
                    offer['categories'] = nutri['categories']
                    offer['ean'] = ean
        
        offers.append(offer)
        time.sleep(0.1)
    
    print(f"  Intermarche: {len(offers)} offres uniques")
    return offers

def fetch_other_stores():
    """Fetch other stores using scrapers"""
    from scrapers import STORE_SCRAPERS
    
    offers = {}
    for store, scraper_func in STORE_SCRAPERS.items():
        try:
            print(f"Scraping {store}...")
            store_offers = scraper_func()
            
            # Enrich with Nutri-Score
            for offer in store_offers:
                name = offer.get('name', '')
                if not should_skip_nutriscore(name):
                    ean = get_ean_from_mapping(store, name) or search_openfoodfacts_ean(name)
                    if ean:
                        nutri = fetch_nutri_info(ean)
                        if nutri and nutri['nutriscore']:
                            offer['nutriscore'] = nutri['nutriscore']
                            offer['nova_group'] = nutri['nova_group']
                            offer['nutrition'] = {k: v for k, v in nutri.items() 
                                                if k in ['energy_kcal_100g', 'fat_100g', 'saturated_fat_100g',
                                                         'carbs_100g', 'sugars_100g', 'fiber_100g',
                                                         'proteins_100g', 'salt_100g']}
                            offer['ingredients'] = nutri['ingredients']
                            offer['allergens'] = nutri['allergens']
                            offer['additives'] = nutri['additives']
                            offer['labels'] = nutri['labels']
                            offer['brands'] = nutri['brands']
                            offer['categories'] = nutri['categories']
                            offer['ean'] = ean
                time.sleep(0.2)
            
            offers[store] = store_offers
            print(f"  {store}: {len(store_offers)} offres")
        except Exception as e:
            print(f"  Error scraping {store}: {e}")
            offers[store] = []
    
    return offers

def remove_expired_promos(promos, max_age_days=30):
    """Remove promos older than max_age_days"""
    cutoff = datetime.utcnow() - timedelta(days=max_age_days)
    removed = 0
    
    for store in promos['offers']:
        original = len(promos['offers'][store])
        promos['offers'][store] = [
            o for o in promos['offers'][store]
            if 'fetched_at' not in o or datetime.fromisoformat(o['fetched_at'].replace('Z', '')) > cutoff
        ]
        removed += original - len(promos['offers'][store])
    
    if removed > 0:
        print(f"Removed {removed} expired promos (> {max_age_days} days)")
    return removed

def main():
    print(f"=== Auto-update promos started at {datetime.utcnow().isoformat()}Z ===")
    
    # Load existing promos
    if PROMOS_FILE.exists():
        promos = load_json(PROMOS_FILE)
    else:
        promos = {'generated_at': '', 'offers': {}}
    
    # Remove expired
    remove_expired_promos(promos)
    
    # Fetch all stores
    all_offers = {}
    
    # Intermarche (API)
    try:
        all_offers['intermarche'] = fetch_intermarche()
    except Exception as e:
        print(f"Error fetching Intermarche: {e}")
        all_offers['intermarche'] = promos['offers'].get('intermarche', [])
    
    # Other stores (scrapers)
    try:
        other = fetch_other_stores()
        all_offers.update(other)
    except Exception as e:
        print(f"Error fetching other stores: {e}")
        for store in ['colruyt', 'delhaize', 'carrefour', 'lidl', 'aldi', 'spar']:
            if store not in all_offers:
                all_offers[store] = promos['offers'].get(store, [])
    
    # Update promos
    promos['generated_at'] = datetime.utcnow().isoformat() + 'Z'
    
    # Purge des promos réellement expirées par date de validité (valid_until).
    # Grâce de 2 jours : les folders hebdomadaires se terminent la veille du
    # jour de rotation (ex. « du 15 au 21/09 » scruté le 22/09) — sans cette
    # marge on viderait toute l'enseigne le jour où le nouveau folder tarde.
    grace = (datetime.utcnow() - timedelta(days=2)).strftime('%Y-%m-%d')
    expired_count = 0
    for store, offers in all_offers.items():
        kept = []
        for o in offers:
            vu = o.get('valid_until')
            if vu and str(vu) < grace:
                expired_count += 1
                continue
            kept.append(o)
        all_offers[store] = kept
    if expired_count > 0:
        print(f"Removed {expired_count} promos expirées (valid_until < {today})")
    
    promos['offers'] = all_offers
    
    # Save
    save_json(PROMOS_FILE, promos)
    
    # Stats
    total = sum(len(v) for v in all_offers.values())
    with_nutri = sum(1 for v in all_offers.values() for o in v if o.get('nutriscore'))
    
    print(f"\n=== SUMMARY ===")
    print(f"Total offers: {total}")
    print(f"With Nutri-Score: {with_nutri} ({with_nutri/total*100:.1f}%)")
    for store, offers in all_offers.items():
        n = len(offers)
        nn = sum(1 for o in offers if o.get('nutriscore'))
        print(f"  {store}: {n} ({nn} with Nutri-Score)")
    
    return True

if __name__ == '__main__':
    try:
        main()
        sys.exit(0)
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)