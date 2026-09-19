#!/usr/bin/env python3
"""
Fast auto-update promos - basic data only (no Nutri-Score during daily update)
"""

import sys
sys.path.insert(0, r'C:\magasin')

import json
import requests
import time
from datetime import datetime, timedelta
from pathlib import Path
from bs4 import BeautifulSoup

import scripts.scrapers as scrapers_module

UA = {'User-Agent': 'PromoApp/1.0 (https://github.com/borzeeb-coder/magasin)'}
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
IMAGES_DIR = DATA_DIR / 'images'
PROMOS_FILE = DATA_DIR / 'promos.json'

INTERMARCHE_CONFIG = {
    'api_url': 'https://folders.intermarche.be/.2026-s38fr/publication/contents/templates/wishlistV4/products.json',
    'image_cdn': 'https://fr.zone-secure.net/863887/2701390/',
}

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def download_image(url, local_path):
    if not url or url.startswith('data:'):
        return False
    for attempt in range(2):
        try:
            r = requests.get(url, headers=UA, timeout=15, stream=True)
            if r.status_code == 200 and len(r.content) > 1000:
                local_path.parent.mkdir(parents=True, exist_ok=True)
                with open(local_path, 'wb') as f:
                    f.write(r.content)
                return True
        except:
            time.sleep(0.5)
    return False

def fetch_intermarche():
    print("Fetching Intermarche...")
    config = INTERMARCHE_CONFIG
    r = requests.get(config['api_url'], headers=UA, timeout=30)
    r.raise_for_status()
    products = r.json()
    
    offers = []
    seen = set()
    
    for p in products:
        name = p.get('Nom produit', '').strip()
        if not name or name in seen:
            continue
        seen.add(name)
        
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
            'source_url': 'https://www.intermarche.be/folders/decouvrez-notre-folder-du-15-09-26/',
            'fetched_at': datetime.utcnow().isoformat() + 'Z',
        }
        
        if p.get('images'):
            download_image(img_url, IMAGES_DIR / img_filename)
        
        offers.append(offer)
        time.sleep(0.05)
    
    print(f"  Intermarche: {len(offers)} offres")
    return offers

def main():
    print(f"=== Fast update started at {datetime.utcnow().isoformat()}Z ===")
    
    # Load existing to keep Nutri-Score data
    if PROMOS_FILE.exists():
        promos = load_json(PROMOS_FILE)
    else:
        promos = {'generated_at': '', 'offers': {}}
    
    # Remove expired (> 30 days)
    cutoff = datetime.utcnow() - timedelta(days=30)
    for store in promos['offers']:
        original = len(promos['offers'][store])
        promos['offers'][store] = [
            o for o in promos['offers'][store]
            if 'fetched_at' not in o or datetime.fromisoformat(o['fetched_at'].replace('Z', '')) > cutoff
        ]
        removed = original - len(promos['offers'][store])
        if removed > 0:
            print(f"Removed {removed} expired {store} promos")
    
    # Preserve existing Nutri-Score data by name or EAN
    nutri_cache = {}
    for store, offers in promos['offers'].items():
        for o in offers:
            if o.get('nutriscore'):
                data = {k: v for k, v in o.items() 
                    if k in ['nutriscore', 'nova_group', 'nutrition', 'ingredients', 
                            'allergens', 'additives', 'labels', 'brands', 'categories', 'ean']}
                if o.get('ean'):
                    nutri_cache[o['ean']] = data
                nutri_cache[o.get('name', '')] = data
    
    # Fetch new data
    all_offers = {}
    
    # Reload scrapers module to get latest code
    import importlib
    importlib.reload(scrapers_module)
    from scripts.scrapers import scrape_aldi, scrape_carrefour, scrape_delhaize, scrape_lidl, scrape_colruyt
    
    try:
        all_offers['intermarche'] = fetch_intermarche()
    except Exception as e:
        print(f"Error Intermarche: {e}")
        all_offers['intermarche'] = promos['offers'].get('intermarche', [])
    
    try:
        print("Scraping Aldi...")
        all_offers['aldi'] = scrape_aldi()
    except Exception as e:
        print(f"Error Aldi: {e}")
        all_offers['aldi'] = promos['offers'].get('aldi', [])
    
    try:
        print("Scraping Carrefour...")
        all_offers['carrefour'] = scrape_carrefour()
    except Exception as e:
        print(f"Error Carrefour: {e}")
        all_offers['carrefour'] = promos['offers'].get('carrefour', [])
    
    try:
        print("Scraping Delhaize (12 pages, ~480 products)...")
        all_offers['delhaize'] = scrape_delhaize(max_pages=12)
    except Exception as e:
        print(f"Error Delhaize: {e}")
        all_offers['delhaize'] = promos['offers'].get('delhaize', [])
    
    try:
        print("Scraping Lidl...")
        all_offers['lidl'] = scrape_lidl()
    except Exception as e:
        print(f"Error Lidl: {e}")
        all_offers['lidl'] = promos['offers'].get('lidl', [])
    
    try:
        print("Scraping Colruyt...")
        all_offers['colruyt'] = scrape_colruyt()
    except Exception as e:
        print(f"Error Colruyt: {e}")
        all_offers['colruyt'] = promos['offers'].get('colruyt', [])
    
    # Keep other stores as-is (no scrapers yet)
    for store in ['spar']:
        all_offers[store] = promos['offers'].get(store, [])
    
    # Restore Nutri-Score from cache
    for store, offers in all_offers.items():
        for o in offers:
            cached = None
            if o.get('ean'):
                cached = nutri_cache.get(o['ean'])
            if cached is None:
                cached = nutri_cache.get(o.get('name', ''))
            if cached:
                o.update(cached)
    
    # Update promos
    promos['generated_at'] = datetime.utcnow().isoformat() + 'Z'
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
        print(f"FATAL: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)