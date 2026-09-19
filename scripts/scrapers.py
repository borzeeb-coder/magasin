#!/usr/bin/env python3
"""
Real scrapers for Belgian supermarket promotions
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import quote

UA = {'User-Agent': 'PromoApp/1.0 (https://github.com/borzeeb-coder/magasin)'}


def parse_price(price_text: str) -> Optional[float]:
    """Parse price from text like '2,99 €' or '€ 2.99'"""
    if not price_text:
        return None
    text = price_text.replace('€', '').replace('EUR', '').strip()
    text = text.replace(',', '.')
    match = re.search(r'[\d.]+', text)
    if match:
        try:
            return float(match.group())
        except:
            pass
    return None


def should_skip_nutriscore(name: str) -> bool:
    """Check if product should not have Nutri-Score"""
    name_lower = name.lower()
    skip_keywords = [
        # Alcool
        'alcool', 'vin', 'bière', 'spiritueux', 'whisky', 'vodka', 'rhum', 'gin',
        'champagne', 'cidre', 'apéritif', 'digestif', 'liqueur',
        
        # Ménage / Nettoyage
        'ménage', 'lessive', 'nettoyant', 'détergent', 'assouplissant',
        'nettoyage', 'produit vaisselle', 'liquide vaisselle', 'pastille lave-vaisselle',
        'eau de javel', 'désinfectant', 'détartrant', 'dégraissant',
        'époussette', 'balai', 'serpillière', 'aspirateur', 'nettoyeur',
        'éponge', 'chiffon', 'gant ménage', 'seau', 'pelle', 'balayette',
        
        # Hygiène / Beauté
        'hygiène', 'shampoing', 'savon', 'dentifrice', 'déodorant', 'gel douche',
        'cosmétique', 'maquillage', 'crème', 'parfum', 'soin',
        'crème visage', 'crème corps', 'lait corps', 'huile corps',
        'protection solaire', 'après-soleil', 'baume', 'stick lèvres',
        
        # Bricolage / Jardin / Outillage
        'bricolage', 'outillage', 'quincaillerie', 'jardin', 'jardinage',
        'coupe-branches', 'élagueur', 'élagueuse', 'taille-haie', 'tronçonneuse', 'tronçonneuse',
        'tondeuse', 'débroussailleuse', 'souffleur', 'broyeur', 'scarificateur',
        'arrosoir', 'pelle', 'râteau', 'bêche', 'fourche', 'houe', 'griffe',
        'pot de fleurs', 'jardinière', 'terreau', 'engrais', 'terre', 'paillis',
        'serre', 'tunnel', 'filet protection', 'filet jardin', 'tuteur', 'arrosage', 'programmateur',
        'perceuse', 'visseuse', 'scie', 'ponceuse', 'meuleuse', 'niveau',
        'mètre', 'marteau', 'tournevis', 'clé', 'pince', 'étau', 'serre-joint',
        'peinture', 'vernis', 'lasure', 'pinceau', 'rouleau', 'brosse',
        'papier peint', 'enduit', 'plâtre', 'ciment', 'mortier', 'carrelage',
        
        # Maison / Déco / Textile
        'textile', 'literie', 'vêtement', 'chaussette', 'sous-vêtement',
        'pyjama', 'peignoir', 'chausson', 'pantoufle', 'ceinture',
        'rideau', 'voilage', 'store', 'coussin', 'plaid', 'couverture',
        'drap', 'taie', 'housse', 'protège-matelas', 'oreiller',
        'décoration', 'déco', 'vase', 'bougie', 'photophore', 'cadre',
        'horloge', 'miroir', 'étagère', 'rangement', 'boîte', 'panier',
        'poubelle', 'sac poubelle', 'sac congélation', 'film alimentaire',
        'papier aluminium', 'papier cuisson', 'sac courses', 'cabats',
        
        # Jouets / Loisirs
        'jouet', 'jeu', 'puzzle', 'album', 'collection', 'peluche',
        'figurine', 'lego', 'playmobil', 'poupée', 'voiture', 'circuit',
        'jeu société', 'jeu vidéo', 'console', 'manette', 'casque gaming',
        
        # Animalerie (non alimentaire)
        'litière', 'griffoir', 'arbre à chat', 'niche', 'laisse', 'collier',
        'harnais', 'muselière', 'gamelle', 'fontaine', 'jouet chat', 'jouet chien',
        
        # Alimentation animale (non Nutri-Score)
        'nourriture pour chat', 'nourriture pour chien', 'croquette', 'pâtée',
        'friandise chat', 'friandise chien', 'sabot', 'os à mâcher',
        'litière chat', 'sable chat', 'pipi chat',
        
        # Auto / Moto
        'auto', 'moto', 'huile moteur', 'liquide frein', 'liquide refroidissement',
        'pneu', 'chaîne neige', 'grattoir', 'housse siège', 'tapis voiture',
        
        # Papeterie / Bureau
        'papier', 'carnet', 'stylo', 'crayon', 'gomme', 'taille-crayon',
        'règle', 'ciseaux', 'colle', 'scotch', 'agrafeuse', 'perforatrice',
        'chemise', 'classeur', 'intercalaire', 'pochette', 'registre',
        
        # Électroménager (non cuisson)
        'fer à repasser', 'centrale vapeur', 'aspirateur', 'robot aspirateur',
        'ventilateur', 'chauffage', 'radiateur', 'humidificateur', 'purificateur',
        'sèche-cheveux', 'lisseur', 'tondeuse cheveux', 'rasoir électrique',
        
        # Divers
        'pile', 'batterie', 'chargeur', 'câble', 'prise', 'multiprise',
        'ampoule', 'tube néon', 'led', 'détecteur fumée', 'extincteur',
        'coffre fort', 'alarme', 'caméra', 'interphone', 'sonnette',
    ]
    return any(kw in name_lower for kw in skip_keywords)


# ============ ALDI SCRAPER ============

def scrape_aldi() -> List[Dict]:
    """Scrape Aldi promotions from their Next.js API data"""
    url = 'https://www.aldi.be/fr/offres.html'
    
    try:
        r = requests.get(url, headers=UA, timeout=20)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        scripts = soup.find_all('script', id='__NEXT_DATA__')
        for s in scripts:
            if s.string:
                data = json.loads(s.string)
                api_data = data.get('props', {}).get('pageProps', {}).get('apiData', '')
                
                # Parse the JSON string
                try:
                    parsed = json.loads(api_data)
                    
                    # Structure: [["OFFER_GET", {"res": {"algoliaDataMap": {...}}}], ...]
                    for item in parsed:
                        if isinstance(item, list) and len(item) >= 2:
                            action = item[0]
                            payload = item[1]
                            if action == 'OFFER_GET' and 'res' in payload:
                                res = payload['res']
                                if 'algoliaDataMap' in res:
                                    return _parse_aldi_offers(res['algoliaDataMap'])
                except Exception as e:
                    print(f"Aldi parse error: {e}")
        
    except Exception as e:
        print(f"Aldi scrape error: {e}")
    
    return []


def _parse_aldi_offers(algolia_map: Dict) -> List[Dict]:
    """Parse Aldi offers from algoliaDataMap"""
    offers = []
    
    for offer_id, offer_data in algolia_map.items():
        try:
            name = offer_data.get('name', '').strip()
            if not name:
                continue
            
            # Skip non-food items
            if should_skip_nutriscore(name):
                continue
            
            # Price
            current_price = offer_data.get('currentPrice', {})
            price_val = None
            old_price = None
            
            if isinstance(current_price, dict):
                price_val = current_price.get('priceValue')
                strike = current_price.get('strikePrice')
                if isinstance(strike, dict):
                    old_price = strike.get('strikePriceValue')
            
            if price_val is None:
                continue
            
            # Discount
            discount_pct = None
            if old_price and price_val and old_price > price_val:
                discount_pct = round((1 - price_val / old_price) * 100)
            
            # Image
            img_url = ''
            assets = offer_data.get('assets', [])
            if assets and isinstance(assets, list):
                for asset in assets:
                    if isinstance(asset, dict) and asset.get('type') == 'primary':
                        img_url = asset.get('url', '')
                        break
            
            # Category
            category = ''
            hier = offer_data.get('hierarchicalCategories', {})
            if isinstance(hier, dict):
                category = hier.get('lvl1', '') or hier.get('lvl0', '')
            
            # Brand
            brand = offer_data.get('brandName', '')
            
            # Build offer
            offer = {
                'name': name,
                'brand': brand,
                'category': category,
                'description': offer_data.get('shortDescription', '') or offer_data.get('longDescription', ''),
                'new_price': price_val,
                'old_price': old_price,
                'discount_pct': discount_pct,
                'promo_text': f"-{discount_pct}%" if discount_pct else '',
                'unit': offer_data.get('salesUnit', ''),
                'image_url': img_url,
                'source_url': f'https://www.aldi.be/fr/{offer_data.get("productSlug", "")}',
                'fetched_at': datetime.utcnow().isoformat() + 'Z',
                'ean': None,  # Aldi doesn't expose EAN in this data
            }
            
            offers.append(offer)
            
        except Exception as e:
            print(f"Error parsing Aldi offer {offer_id}: {e}")
            continue
    
    print(f"Aldi: {len(offers)} valid food offers")
    return offers


# ============ CARREFOUR SCRAPER ============

CARREFOUR_API_URL = 'https://www.carrefour.be/on/demandware.store/Sites-carrefour-be-Site/fr_BE/Search-UpdateGrid'


def scrape_carrefour() -> List[Dict]:
    """Scrape Carrefour Belgium weekly promotions via SFCC API (Search-UpdateGrid).

    One request returns all products in the promotions category (up to sz=500).
    """
    offers = []
    
    try:
        params = {
            'cgid': 'promotions-navigation',
            'pmin': '0,01',
            'start': '0',
            'sz': '200',
        }
        r = requests.get(CARREFOUR_API_URL, params=params, headers=UA, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        
        products = [p for p in soup.find_all('div')
                    if 'js-product' in (p.get('class') or []) and p.get('data-pid')]
        
        for p in products:
            try:
                offer = _parse_carrefour_tile(p)
                if offer and not should_skip_nutriscore(offer['name']):
                    offers.append(offer)
            except Exception as e:
                print(f"Error parsing Carrefour tile: {e}")
                continue

    except Exception as e:
        print(f"Carrefour scrape error: {e}")
    
    offers = _dedupe_carrefour(offers)
    print(f"Carrefour: {len(offers)} valid food offers")
    return offers


def _parse_carrefour_tile(p) -> Optional[Dict]:
    """Parse a Carrefour product tile from the Search-UpdateGrid API response."""
    pid = p.get('data-pid', '')
    
    # Name
    name_el = p.select_one('.pdp-link .link')
    name = name_el.get_text(strip=True) if name_el else ''
    if not name:
        mobile = p.select_one('.mobile-name')
        name = mobile.get_text(strip=True) if mobile else ''
    if not name:
        img = p.select_one('.tile-image')
        name = img.get('alt') if img else ''
    name = name.strip()
    if not name:
        return None
    # Name appears twice (mobile + desktop) in some tiles - dedupe
    mid = len(name) // 2
    if len(name) > 4 and name[:mid] == name[mid:]:
        name = name[:mid]
    
    # Image
    img_url = ''
    img_tag = p.select_one('.tile-image')
    if img_tag:
        img_url = img_tag.get('src') or img_tag.get('data-src') or img_tag.get('data-lazy-src') or ''
    if not img_url and pid:
        img_url = f'https://cdn.carrefour.eu/420_{pid}_T1.webp'
    
    # Price
    new_price = None
    price_el = p.select_one('.sales .value')
    if price_el and price_el.get('content'):
        try:
            new_price = float(price_el['content'])
        except:
            pass
    elif price_el:
        new_price = parse_price(price_el.get_text(strip=True))
    
    # Promo badge text + validity
    promo_text = ''
    validity = ''
    promo_tag = p.select_one('.promo-tag-text')
    if promo_tag:
        promo_text = promo_tag.get_text(strip=True)
    validity_el = p.select_one('.promo-validity-date')
    if validity_el:
        validity = validity_el.get_text(strip=True)
    if promo_text and validity:
        promo_text = promo_text + ' - ' + validity
    elif validity:
        promo_text = validity
    
    # Brand
    brand_el = p.select_one('.brand-wrapper a')
    brand = brand_el.get_text(strip=True) if brand_el else ''
    
    # Unit price
    unit = ''
    unit_el = p.select_one('.price-per-unit-wrapper')
    if unit_el:
        unit = unit_el.get_text(strip=True)
    
    # Product URL
    source_url = ''
    link = p.select_one('.pdp-link a')
    if link and link.get('href'):
        href = link['href']
        source_url = href if href.startswith('http') else 'https://www.carrefour.be' + href
    
    # Category from GTM data attribute
    category = ''
    gtm = p.get('data-select-item-event-object')
    if gtm:
        try:
            gtm_json = json.loads(gtm.replace('&quot;', '"'))
            items = gtm_json.get('ecommerce', {}).get('items', [])
            if items and items[0].get('item_category'):
                category = items[0]['item_category']
        except:
            pass
    
    # EAN - Carrefour product IDs are 8-digit codes, not always EANs
    ean = pid if pid.isdigit() and len(pid) == 13 else None
    
    offer = {
        'name': name,
        'brand': brand,
        'category': category,
        'description': '',
        'new_price': new_price,
        'old_price': None,
        'discount_pct': None,
        'promo_text': promo_text,
        'unit': unit,
        'image_url': img_url,
        'source_url': source_url,
        'fetched_at': datetime.utcnow().isoformat() + 'Z',
        'ean': ean,
    }
    
    return offer


def _dedupe_carrefour(offers: List[Dict]) -> List[Dict]:
    """Remove duplicate names from Carrefour offers"""
    seen = set()
    unique = []
    for o in offers:
        name = o.get('name', '')
        if name and name not in seen:
            seen.add(name)
            unique.append(o)
    return unique


# ============ DELHAIZE SCRAPER (Placeholder - needs GraphQL/API) ============

def scrape_delhaize() -> List[Dict]:
    """Scrape Delhaize promotions - needs GraphQL API"""
    # Delhaize uses GraphQL API that requires authentication/tokens
    # For now, return empty list
    print("Delhaize: GraphQL API needed - skipping")
    return []


# ============ LIDL SCRAPER (Placeholder - needs API) ============

def scrape_lidl() -> List[Dict]:
    """Scrape Lidl promotions - needs API endpoint"""
    # Lidl uses Vue/Pinia with complex state - need to find API
    print("Lidl: API endpoint needed - skipping")
    return []


# ============ COLRUYT SCRAPER (AntiBot protected) ============

def scrape_colruyt() -> List[Dict]:
    """Scrape Colruyt - blocked by AntiBot"""
    print("Colruyt: AntiBot protection - skipping")
    return []


# ============ SPAR SCRAPER (Wrong URL) ============

def scrape_spar() -> List[Dict]:
    """Scrape Spar promotions"""
    # Spar URL redirects to gratisbox, not promotions
    print("Spar: No promotions page found - skipping")
    return []


# ============ MAIN EXPORTS ============

STORE_SCRAPERS = {
    'aldi': scrape_aldi,
    'carrefour': scrape_carrefour,
    'delhaize': scrape_delhaize,
    'lidl': scrape_lidl,
    'colruyt': scrape_colruyt,
    'spar': scrape_spar,
}