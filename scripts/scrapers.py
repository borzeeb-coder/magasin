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

def scrape_carrefour() -> List[Dict]:
    """Scrape Carrefour promotions using JSON-LD ItemList + Product pages"""
    url = 'https://www.carrefour.be/fr/promotions'
    offers = []
    
    try:
        r = requests.get(url, headers=UA, timeout=20)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Get product URLs from ItemList JSON-LD
        product_urls = _get_carrefour_product_urls(soup)
        
        # Fetch each product page (limit to avoid timeout)
        for purl in product_urls[:20]:  # Limit to 20 for speed
            try:
                offer = _fetch_carrefour_product(purl)
                if offer and not should_skip_nutriscore(offer['name']):
                    offers.append(offer)
                time.sleep(0.2)  # Be nice
            except Exception as e:
                print(f"Error fetching Carrefour product {purl}: {e}")
                continue
        
    except Exception as e:
        print(f"Carrefour scrape error: {e}")
    
    print(f"Carrefour: {len(offers)} valid food offers")
    return offers


def _get_carrefour_product_urls(soup: BeautifulSoup) -> List[str]:
    """Extract product URLs from ItemList JSON-LD"""
    urls = []
    scripts = soup.find_all('script', type='application/ld+json')
    for s in scripts:
        if s.string:
            try:
                ld = json.loads(s.string)
                if ld.get('@type') == 'ItemList':
                    for item in ld.get('itemListElement', []):
                        if item.get('@type') == 'ListItem' and item.get('url'):
                            urls.append(item['url'])
            except:
                pass
    return urls


def _fetch_carrefour_product(url: str) -> Optional[Dict]:
    """Fetch full product data from Carrefour product page"""
    try:
        r = requests.get(url, headers=UA, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Get Product JSON-LD
        scripts = soup.find_all('script', type='application/ld+json')
        for s in scripts:
            if s.string:
                try:
                    ld = json.loads(s.string)
                    if ld.get('@type') == 'Product':
                        return _parse_carrefour_product(ld, url)
                except:
                    pass
    except Exception as e:
        print(f"Error fetching Carrefour product {url}: {e}")
    
    return None


def _parse_carrefour_product(ld: Dict, url: str) -> Optional[Dict]:
    """Parse Product JSON-LD into offer format"""
    try:
        name = ld.get('name', '').strip()
        if not name:
            return None
        
        # Price
        offers = ld.get('offers', {})
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        
        price = offers.get('price')
        old_price = None
        
        # Try to get old price from strike-through or was-price
        # (would need to parse HTML for this)
        
        # Discount
        discount_pct = None
        # Could calculate if we have both prices
        
        # Image
        img_url = ''
        img = ld.get('image')
        if isinstance(img, list):
            img_url = img[0] if img else ''
        elif isinstance(img, str):
            img_url = img
        
        # SKU/EAN
        sku = ld.get('sku', '') or ld.get('mpn', '')
        
        offer = {
            'name': name,
            'brand': ld.get('brand', {}).get('name', '') if isinstance(ld.get('brand'), dict) else '',
            'category': '',  # Not in Product schema
            'description': ld.get('description', ''),
            'new_price': float(price) if price else None,
            'old_price': old_price,
            'discount_pct': None,
            'promo_text': '',
            'unit': '',
            'image_url': img_url,
            'source_url': url,
            'fetched_at': datetime.utcnow().isoformat() + 'Z',
            'ean': sku if sku and sku.isdigit() and len(sku) in [8, 13] else None,
        }
        
        return offer
    except Exception as e:
        print(f"Error parsing Carrefour product: {e}")
        return None


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