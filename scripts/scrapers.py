#!/usr/bin/env python3
"""
Real scrapers for Belgian supermarket promotions
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import quote

UA = {'User-Agent': 'PromoApp/1.0 (https://github.com/borzeeb-coder/magasin)'}

# ============ VALIDITÉ DES PROMOS (dates réelles) ============
# Les formats varient selon l'enseigne :
#   - Carrefour  : "Offre valable jusqu'au 21/09/2026 inclus"
#   - Delhaize   : champ API endDate "23/09/2026 ..." (ou ISO)
#   - Colruyt    : "jusqu'au 22-SEP-26"
#   - Action     : "Valable: 16 sep jusqu'au 22 sep" (traduit du néerlandais)

_MONTH_KEYS = {
    'jan': 1, 'janv': 1, 'feb': 2, 'fev': 2, 'fév': 2, 'mar': 3, 'mars': 3,
    'apr': 4, 'avr': 4, 'mei': 5, 'mai': 5, 'may': 5, 'jun': 6, 'juin': 6,
    'jui': 7, 'juil': 7, 'jul': 7, 'aug': 8, 'ao': 8, 'août': 8, 'aout': 8,
    'sep': 9, 'sept': 9, 'oct': 10, 'okt': 10, 'nov': 11, 'dec': 12, 'déc': 12,
}

_DAY_MONTH_RE = re.compile(r'(\d{1,2})\s*(?:-|/|\s+)([A-Za-zéûÉÛ]{3,5})')
_DMY_RE = re.compile(r'(\d{1,2})/(\d{1,2})/(\d{4})')
_ISO_RE = re.compile(r'(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)')
_FOLDER_URL_RE = re.compile(r'du[_-](\d{1,2})[_-](\d{1,2})[_-](\d{2})')


def _month_num(word: str) -> Optional[int]:
    key = (word or '').lower().replace('.', '').strip()[:4]
    return _MONTH_KEYS.get(key)


def _to_iso(year: int, month: int, day: int) -> Optional[str]:
    try:
        y, m, d = int(year), int(month), int(day)
        if 1 <= m <= 12 and 1 <= d <= 31:
            return f'{y:04d}-{m:02d}-{d:02d}'
    except (TypeError, ValueError):
        pass
    return None


def _resolve_year(month: int, day: int) -> int:
    """Année la plus probable pour un couple (jour, mois) sans année."""
    now = datetime.utcnow()
    y = now.year
    cand = _to_iso(y, month, day)
    if cand is None:
        return y
    if cand < now.strftime('%Y-%m-%d'):
        # Date déjà passée : si elle date de plus de 100 jours, c'est sans
        # doute une promo de la fin d'année précédente → année suivante.
        if (now - datetime.strptime(cand, '%Y-%m-%d')).days > 100:
            return y + 1
    return y


def parse_validity(text) -> (Optional[str], Optional[str]):
    """Extrait (valid_from, valid_until) en ISO (YYYY-MM-DD) depuis un texte
    de validité. Renvoie (None, None) quand aucune date exploitable."""
    if not text:
        return None, None
    t = str(text)
    found = []
    for m in _DMY_RE.finditer(t):
        iso = _to_iso(m.group(3), m.group(2), m.group(1))
        if iso:
            found.append(iso)
    for m in _ISO_RE.finditer(t):
        found.append(m.group(0))
    for m in _DAY_MONTH_RE.finditer(t):
        mon = _month_num(m.group(2))
        if not mon:
            continue
        day = int(m.group(1))
        tail = t[m.end():m.end() + 8]
        y = re.match(r'\s*(\d{4})', tail)
        if y:
            iso = _to_iso(int(y.group(1)), mon, day)
        else:
            yy = re.match(r'[-/]?\s*(\d{2})(?!\d)', tail)
            iso = (_to_iso(2000 + int(yy.group(1)), mon, day) if yy else
                   _to_iso(_resolve_year(mon, day), mon, day))
        if iso:
            found.append(iso)
    if not found:
        return None, None
    cleaned = sorted(set(found))
    return cleaned[0], cleaned[-1]


def folder_period_from_url(url) -> (Optional[str], Optional[str]):
    """Période d'un prospectus Intermarché (du-DD-MM-YY → lundi à dimanche)."""
    if not url:
        return None, None
    m = _FOLDER_URL_RE.search(url)
    if not m:
        return None, None
    day, month, yy = int(m.group(1)), int(m.group(2)), int(m.group(3))
    year = 2000 + yy if yy < 100 else yy
    from_iso = _to_iso(year, month, day)
    if from_iso is None:
        return None, None
    start = datetime.strptime(from_iso, '%Y-%m-%d')
    return from_iso, (start + timedelta(days=6)).strftime('%Y-%m-%d')


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


def parse_unit_price(unit_text: str) -> tuple[Optional[float], Optional[str]]:
    """
    Parse unit price text like '2,50 €/kg', '1,20 €/L', '0,50 €/100g', '3,00 €/pièce'
    Returns (price_per_kg_or_l, unit) where unit is 'kg', 'l', '100g', 'piece', etc.
    Normalizes everything to price per kg (for solids) or per L (for liquids).
    """
    if not unit_text:
        return None, None
    
    text = unit_text.lower().replace('€', '').replace('eur', '').strip()
    text = text.replace(',', '.')
    
    # Patterns: "2.50 /kg", "2.50/kg", "2.50 €/kg", "1.20 €/l", "0.50 €/100g", "3.00 /pièce"
    patterns = [
        (r'([\d.]+)\s*/\s*kg', 'kg'),
        (r'([\d.]+)\s*/\s*l', 'l'),
        (r'([\d.]+)\s*/\s*100g', '100g'),
        (r'([\d.]+)\s*/\s*g', 'g'),
        (r'([\d.]+)\s*/\s*ml', 'ml'),
        (r'([\d.]+)\s*/\s*pièce', 'piece'),
        (r'([\d.]+)\s*/\s*pc', 'piece'),
        (r'([\d.]+)\s*/\s*st', 'piece'),
        (r'([\d.]+)\s*/\s*stuks?', 'piece'),
    ]
    
    for pattern, unit in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                price = float(match.group(1))
                return price, unit
            except:
                pass
    
    return None, None


def normalize_price_per_kg_l(price: float, unit: str, quantity: float = None, quantity_unit: str = None) -> tuple[Optional[float], Optional[float]]:
    """
    Normalize price to price_per_kg and price_per_l.
    Returns (price_per_kg, price_per_l)
    
    Args:
        price: Total price
        unit: Unit from unit price ('kg', 'l', '100g', 'g', 'ml', 'piece')
        quantity: Product quantity (e.g., 500 for 500g)
        quantity_unit: Unit of quantity ('g', 'kg', 'ml', 'l', 'piece')
    """
    price_per_kg = None
    price_per_l = None
    
    # If we have unit price directly
    if unit == 'kg' and price:
        price_per_kg = price
    elif unit == 'l' and price:
        price_per_l = price
    elif unit == '100g' and price:
        price_per_kg = price * 10
    elif unit == 'g' and price:
        price_per_kg = price * 1000
    elif unit == 'ml' and price:
        price_per_l = price * 1000
    elif unit == 'piece' and price and quantity and quantity_unit:
        # Convert piece to weight/volume if we know quantity
        if quantity_unit in ['g', 'kg']:
            total_kg = quantity / 1000 if quantity_unit == 'g' else quantity
            if total_kg > 0:
                price_per_kg = price / total_kg
        elif quantity_unit in ['ml', 'l']:
            total_l = quantity / 1000 if quantity_unit == 'ml' else quantity
            if total_l > 0:
                price_per_l = price / total_l
    
    # If we have product quantity but no unit price, calculate from total price
    if quantity and quantity_unit and price:
        if not price_per_kg and quantity_unit in ['g', 'kg']:
            total_kg = quantity / 1000 if quantity_unit == 'g' else quantity
            if total_kg > 0:
                price_per_kg = price / total_kg
        if not price_per_l and quantity_unit in ['ml', 'l']:
            total_l = quantity / 1000 if quantity_unit == 'ml' else quantity
            if total_l > 0:
                price_per_l = price / total_l
    
    return price_per_kg, price_per_l


def extract_quantity_from_name(name: str) -> tuple[Optional[float], Optional[str]]:
    """
    Extract quantity and unit from product name.
    Examples: '500g', '1.5kg', '1.5 kg', '500 g', '1L', '1.5 L', '50cl', '50 cl', '6 x 100g', '6x100g'
    Returns (quantity, unit) where unit is 'g', 'kg', 'ml', 'l', 'cl', 'piece'
    """
    if not name:
        return None, None
    
    name_lower = name.lower()
    
    # Patterns for quantity in name
    patterns = [
        # 6 x 100g, 6x100g, 6 x 100 g
        (r'(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl)', 'multi'),
        # 500g, 500 g, 1.5kg, 1.5 kg, 1kg
        (r'(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl)\b', 'simple'),
        # 1L, 1.5L, 50cl, 50 cl
        (r'(\d+(?:[.,]\d+)?)\s*(l|cl)\b', 'simple'),
    ]
    
    for pattern, ptype in patterns:
        match = re.search(pattern, name_lower)
        if match:
            if ptype == 'multi':
                # 6 x 100g -> total 600g
                count = float(match.group(1))
                qty = float(match.group(2).replace(',', '.'))
                unit = match.group(3)
                total_qty = count * qty
                if unit in ['kg', 'l']:
                    return total_qty, unit
                elif unit in ['g', 'ml', 'cl']:
                    if unit == 'cl':
                        return total_qty / 100, 'l'
                    return total_qty, unit
            else:
                qty = float(match.group(1).replace(',', '.'))
                unit = match.group(2)
                if unit in ['kg', 'l']:
                    return qty, unit
                elif unit in ['g', 'ml', 'cl']:
                    if unit == 'cl':
                        return qty / 100, 'l'
                    return qty, unit
    
    return None, None


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
            unit_text = offer_data.get('salesUnit', '')
            unit_price, unit_price_unit = parse_unit_price(unit_text)
            quantity, quantity_unit = extract_quantity_from_name(name)
            price_per_kg, price_per_l = normalize_price_per_kg_l(price_val, unit_price_unit, quantity, quantity_unit)
            
            offer = {
                'name': name,
                'brand': brand,
                'category': category,
                'description': offer_data.get('shortDescription', '') or offer_data.get('longDescription', ''),
                'new_price': price_val,
                'old_price': old_price,
                'discount_pct': discount_pct,
                'promo_text': f"-{discount_pct}%" if discount_pct else '',
                'unit': unit_text,
                'unit_price': unit_price,
                'unit_price_unit': unit_price_unit,
                'price_per_kg': price_per_kg,
                'price_per_l': price_per_l,
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
    valid_from, valid_until = parse_validity(validity)
    
    # Brand
    brand_el = p.select_one('.brand-wrapper a')
    brand = brand_el.get_text(strip=True) if brand_el else ''
    
    # Unit price
    unit_price_text = ''
    unit_el = p.select_one('.price-per-unit-wrapper')
    if unit_el:
        unit_price_text = unit_el.get_text(strip=True)
    unit_price, unit_price_unit = parse_unit_price(unit_price_text)

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
            gtm_json = json.loads(gtm.replace('"', '"'))
            items = gtm_json.get('ecommerce', {}).get('items', [])
            if items and items[0].get('item_category'):
                category = items[0]['item_category']
        except:
            pass
    
    # EAN - Carrefour product IDs are 8-digit codes, not always EANs
    ean = pid if pid.isdigit() and len(pid) == 13 else None
    
    # Parse unit price and calculate price per kg/L
    quantity, quantity_unit = extract_quantity_from_name(name)
    price_per_kg, price_per_l = normalize_price_per_kg_l(new_price, unit_price_unit, quantity, quantity_unit)
    if not price_per_kg and unit_price_text:
        up, up_unit = parse_unit_price(unit_price_text)
        if up:
            price_per_kg, price_per_l = normalize_price_per_kg_l(new_price, up_unit)
    
    offer = {
        'name': name,
        'brand': brand,
        'category': category,
        'description': '',
        'new_price': new_price,
        'old_price': None,
        'discount_pct': None,
        'promo_text': promo_text,
        'unit': unit_price_text,
        'unit_price': unit_price,
        'unit_price_unit': unit_price_unit,
        'price_per_kg': price_per_kg,
        'price_per_l': price_per_l,
        'image_url': img_url,
        'source_url': source_url,
        'fetched_at': datetime.utcnow().isoformat() + 'Z',
        'ean': ean,
    }
    if valid_until:
        offer['valid_until'] = valid_until
    if valid_from:
        offer['valid_from'] = valid_from
    
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


# ============ DELHAIZE SCRAPER ============

DELHAIZE_API_URL = 'https://www.delhaize.be/api/v1/'

# GraphQL query reconstructed from the Delhaize web app bundles.
# productListingType PROMOTION_SEARCH = the promotions listing.
DELHAIZE_QUERY = """query ProductList($productListingType:String!, $lang:String, $sort:String, $searchQuery:String, $productCodes:String, $categoryCode:String, $excludedProductCodes:String, $brands:String, $keywords:String, $productTypes:String, $lazyLoadCount:Int, $pageNumber:Int, $offerId:String, $hideProductsWithoutPromo:Boolean, $hideUnavailableProducts:Boolean, $maxItemsToDisplay:Int, $includePotentialActivatableOffers:Boolean, $facetsOnly:Boolean, $customerSegment:String, $campaignId:String) {productList(productListingType:$productListingType, lang:$lang, sort:$sort, searchQuery:$searchQuery, productCodes:$productCodes, categoryCode:$categoryCode, excludedProductCodes:$excludedProductCodes, brands:$brands, keywords:$keywords, productTypes:$productTypes, lazyLoadCount:$lazyLoadCount, pageNumber:$pageNumber, offerId:$offerId, hideProductsWithoutPromo:$hideProductsWithoutPromo, hideUnavailableProducts:$hideUnavailableProducts, maxItemsToDisplay:$maxItemsToDisplay, includePotentialActivatableOffers:$includePotentialActivatableOffers, facetsOnly:$facetsOnly, customerSegment:$customerSegment, campaignId:$campaignId) {products {...ProductBlockDetails} breadcrumbs {facetCode facetName facetUiType facetValueName facetValueCode removeQuery {query {value}}} facets {code name category facetUiType values {code count name query {query {value}} selected thumbnailUrl}} sorts {name selected code} pagination {currentPage totalResults totalPages sort} freeTextSearch currentQuery {query {value}}}}

fragment ProductBlockDetails on Product {available averageRating numberOfReviews manufacturerName manufacturerSubBrandName code deliveryType country countryFlagUrl badges {...ProductBlockProductBadge} badgeBrand {...ProductBlockProductBadge} promoBadges {...ProductBlockProductBadge} delivered littleLion firstLevelCategory {code name nameNonLocalized url} freshnessDuration freshnessDurationTipFormatted frozen recyclable images {format imageType url} isBundle isProductWithOnlineExclusivePromo isProtectedDesignationOrigin isProtectedGeographicalIndication isWine maxOrderQuantity limitedAssortment mobileFees {...MobileFee} name newProduct onlineExclusive potentialPromotions {...ProductPromotionFragment} potentialActivatablePromotions {...ProductPromotionFragment} price {approximatePriceSymbol currencySymbol currencyIso formattedValue priceType supplementaryPriceLabel1 supplementaryPriceLabel2 showStrikethroughPrice discountedPriceFormatted discountedUnitPriceFormatted unit unitPriceFormatted unitCode unitPrice value wasPrice} purchasable productPackagingQuantity productProposedPackaging productProposedPackaging2 promotionThemes stock {inStock inStockBeforeMaxAdvanceOrderingDate partiallyInStock availableFromDate} url previouslyBought nutriScoreLetter isLowPriceGuarantee isHouseholdBasket isPermanentPriceReduction freeGift plasticFee score bestSellerScore}

fragment ProductBlockProductBadge on ProductBadge {code image {...ProductBlockImage} tooltipMessage name}

fragment ProductBlockImage on Image {altText format galleryIndex imageType url}

fragment ProductPromotionFragment on Promotion {isMassFlashOffer endDate alternativePromotionMessage alternativePromotionBadge code priceToBurn promotionType pickAndMix qualifyingCount freeCount range redemptionLevel toDisplay description title promoBooster simplePromotionMessage offerType restrictionType priority percentageDiscount onlineOnly promotionTypeCode points startDate offerId memberAccountId}

fragment MobileFee on MobileFee {feeName feeValue}"""


def scrape_delhaize(max_pages: int = 12) -> List[Dict]:
    """Scrape Delhaize promotions via their GraphQL API (PROMOTION_SEARCH listing).

    One call = one page of ~40 products. We fetch the first `max_pages` pages.
    """
    offers = []
    seen = set()
    headers = {**UA, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    for page in range(max_pages):
        try:
            variables = {
                'productListingType': 'PROMOTION_SEARCH',
                'lang': 'fr',
                'pageNumber': page,
                'lazyLoadCount': 40,
                'numberOfItemsToDisplay': 40,
                'hideProductsWithoutPromo': False,
                'hideUnavailableProducts': True,
            }
            payload = {'operationName': 'ProductList', 'variables': variables, 'query': DELHAIZE_QUERY}
            r = requests.post(DELHAIZE_API_URL, headers=headers, json=payload, timeout=60)
            r.raise_for_status()
            data = r.json()
            if 'errors' in data:
                print(f"Delhaize page {page} error: {data['errors'][0]['message'][:100]}")
                break
            products = data.get('data', {}).get('productList', {}).get('products', [])
            if not products:
                break

            for p in products:
                code = p.get('code', '')
                name = (p.get('name') or '').strip()
                if not name or code in seen:
                    continue
                if should_skip_nutriscore(name):
                    continue

                price_data = p.get('price') or {}
                new_price = price_data.get('value')
                if new_price is None:
                    new_price = price_data.get('discountedPriceFormatted')
                old_price = price_data.get('wasPrice')

                discount_pct = None
                if old_price and new_price and old_price > new_price:
                    discount_pct = round((1 - new_price / old_price) * 100)

                # Promo text: take the first displayable promotion message
                promo_text = ''
                promo_from = promo_until = None
                for prom in (p.get('potentialPromotions') or []):
                    if prom.get('toDisplay') and (prom.get('description') or prom.get('simplePromotionMessage') or prom.get('title')):
                        promo_text = prom.get('description') or prom.get('simplePromotionMessage') or prom.get('title')
                        end_date = prom.get('endDate')
                        if end_date:
                            date_part = str(end_date).split(' ')[0]
                            promo_text = f"{promo_text} - jusqu'au {date_part}"
                        promo_from, promo_until = parse_validity(str(end_date or ''))
                        if promo_until is None:
                            promo_from, promo_until = parse_validity(str(prom.get('startDate') or end_date or ''))
                        break

                # Brand: manufacturer name or badgeBrand name
                brand = p.get('manufacturerName') or ''
                if not brand:
                    badge = p.get('badgeBrand') or {}
                    brand = badge.get('name') or ''

                # Images
                img_url = ''
                images = p.get('images') or []
                for img in images:
                    if img.get('format') == 'respListGrid' or img.get('imageType') == 'PRIMARY':
                        u = img.get('url', '')
                        if u:
                            img_url = u if u.startswith('http') else 'https://www.delhaize.be' + u
                            break

                # Category
                category = ''
                fc = p.get('firstLevelCategory') or {}
                category = fc.get('name') or fc.get('nameNonLocalized') or ''

                # Unit - use supplementary label ("6 x 75 cl") or unit price
                unit_text = ''
                if price_data.get('supplementaryPriceLabel2'):
                    unit_text = price_data['supplementaryPriceLabel2']
                elif price_data.get('unitPriceFormatted'):
                    unit_text = f"{price_data['unitPriceFormatted']}/{price_data.get('unitCode', '')}".strip('/')
                
                # Parse unit price and calculate price per kg/L
                unit_price, unit_price_unit = parse_unit_price(unit_text)
                quantity, quantity_unit = extract_quantity_from_name(name)
                price_per_kg, price_per_l = normalize_price_per_kg_l(new_price, unit_price_unit, quantity, quantity_unit)
                
                # URL
                url = p.get('url') or ''
                source_url = url if url.startswith('http') else 'https://www.delhaize.be' + url

                offer = {
                    'name': name,
                    'brand': brand,
                    'category': category,
                    'description': '',
                    'new_price': new_price,
                    'old_price': old_price,
                    'discount_pct': discount_pct,
                    'promo_text': promo_text,
                    'unit': unit_text,
                    'unit_price': unit_price,
                    'unit_price_unit': unit_price_unit,
                    'price_per_kg': price_per_kg,
                    'price_per_l': price_per_l,
                    'image_url': img_url,
                    'source_url': source_url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                    'ean': None,
                }
                if promo_until:
                    offer['valid_until'] = promo_until
                if promo_from:
                    offer['valid_from'] = promo_from
                offers.append(offer)
                seen.add(code)

            print(f"Delhaize page {page}: {len(products)} products (total so far {len(offers)})")

        except Exception as e:
            print(f"Delhaize page {page} scrape error: {e}")
            break

    print(f"Delhaize: {len(offers)} valid food offers")
    return offers


# ============ LIDL SCRAPER (via promopromo.be) ============

LIDL_PROMOPROMO_URL = 'https://www.promopromo.be/fr/lidl/folder-offres'


def scrape_lidl() -> List[Dict]:
    """Scrape Lidl promotions from promopromo.be

    promopromo.be aggregates Lidl's weekly folder offers and is not Cloudflare-protected.
    """
    offers = []
    seen = set()
    headers = {**UA, 'Accept-Language': 'fr-BE,fr;q=0.9,nl;q=0.8'}

    try:
        r = requests.get(LIDL_PROMOPROMO_URL, headers=headers, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')

        # Find all offer tiles: links with "?offer=" in href
        offer_tiles = soup.select('a[href*="?offer="]')

        for tile in offer_tiles:
            try:
                text = " ".join(tile.stripped_strings)
                if not text:
                    continue

                # Parse name and prices from text like "20% de remise Bottines Chelsea €24,99 €19,99"
                # Extract prices
                price_matches = re.findall(r'€\s*([\d.,]+)', text)
                prices = [float(p.replace(',', '.')) for p in price_matches]
                
                if len(prices) >= 2:
                    old_price, new_price = prices[0], prices[1]
                elif len(prices) == 1:
                    old_price, new_price = None, prices[0]
                else:
                    continue

                # Extract name (text before first price)
                name_match = re.split(r'€\s*[\d.,]+', text)[0]
                name = re.sub(r'^\d+%\s*de\s*remise\s*', '', name_match, flags=re.IGNORECASE).strip()
                
                if not name or name in seen:
                    continue
                if should_skip_nutriscore(name):
                    continue
                seen.add(name)

                # Discount percentage
                discount_pct = None
                if old_price and new_price and old_price > new_price:
                    discount_pct = round((1 - new_price / old_price) * 100)

                # Discount text
                promo_text = ''
                discount_match = re.search(r'(\d+)%\s*de\s*remise', text, re.IGNORECASE)
                if discount_match:
                    promo_text = f"{discount_match.group(1)}% de remise"

                # Image
                img_url = ''
                img_el = tile.select_one('img')
                if img_el:
                    img_url = img_el.get('src') or img_el.get('data-src') or ''

                # Product URL
                source_url = ''
                href = tile.get('href', '')
                if href:
                    source_url = href if href.startswith('http') else 'https://www.promopromo.be' + href

                # Category
                category = 'Non-food'
                
                # Extract quantity from name for price per kg/L
                quantity, quantity_unit = extract_quantity_from_name(name)
                price_per_kg, price_per_l = normalize_price_per_kg_l(new_price, None, quantity, quantity_unit)

                offer = {
                    'name': name,
                    'brand': '',
                    'category': category,
                    'description': '',
                    'new_price': new_price,
                    'old_price': old_price,
                    'discount_pct': discount_pct,
                    'promo_text': promo_text,
                    'unit': '',
                    'price_per_kg': price_per_kg,
                    'price_per_l': price_per_l,
                    'image_url': img_url,
                    'source_url': source_url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                    'ean': None,
                }
                offers.append(offer)
                seen.add(name)

            except Exception as e:
                print(f"Error parsing Lidl tile: {e}")
                continue

    except Exception as e:
        print(f"Lidl scrape error: {e}")

    print(f"Lidl: {len(offers)} valid offers")
    return offers


# ============ COLRUYT SCRAPER ============

COLRUYT_API_URL = 'https://apip.collectandgo.be/gateway/ecomfoodb2c.eshop.wcsproductviewsearchsvc/v1/store/90004/productview/byCategory/133007'
COLRUYT_API_KEY = '502b657c-624c-11eb-8024-f4d06b721e80'
COLRUYT_IMG_PREFIX = 'https://images.collectandgo.be/images/step/JPG/'


def _colruyt_barcode(attrs: List) -> Optional[str]:
    """Extract the GTIN/EAN barcode from Colruyt attributes."""
    for a in attrs or []:
        s = str(a)
        if "'identifier': 'DefaultBarcode'" in s:
            m = re.search(r"'value': '(\d{8,14})'", s)
            if m:
                return m.group(1)
    return None


def scrape_colruyt() -> List[Dict]:
    """Scrape Colruyt Group promotions (Collect&Go) via their product search API.

    Category 133007 = "Nos meilleures promos" (the weekly promotions listing).
    Returns ~50 products per page; pageNumber 0 starts, then 2, 3, ... (pageNumber=1
    is ignored by the API so we dedupe by product id).
    """
    offers = []
    seen = set()
    headers = {**UA, 'X-CG-APIKey': COLRUYT_API_KEY, 'Accept-Language': 'fr-BE,fr;q=0.9'}

    for target_start in [0, 50, 100, 150, 200, 250, 300, 350]:
        page = 0 if target_start == 0 else (target_start // 50) + 1
        begin = target_start
        params = {
            'catalogId': '10429',
            'searchSource': 'E',
            'beginIndex': begin,
            'langId': '-2',
            'storeId': '90004',
            'categoryId': '133007',
            'categoryNavigation': 'true',
            'pageSize': 50,
            'pageNumber': str(page),
            'orderBy': '1',
            'customFilterExpr': 'x_productstock:10429_*_Y',
            'fromPageParam': 'promos',
        }
        try:
            r = requests.get(COLRUYT_API_URL, params=params, headers=headers, timeout=60)
            r.raise_for_status()
            d = r.json()
            prods = d.get('catalogEntryView', [])
            if not prods:
                break
            start = d.get('recordSetStartNumber', 0)
            if start != target_start:
                # pagination quirk: this pageNumber returned a duplicated page, skip
                print(f"Colruyt start={target_start}: got start={start} (skip duplicate)")
                continue

            for p in prods:
                uid = p.get('uniqueID') or p.get('singleSKUCatalogEntryID')
                name = (p.get('name') or '').strip()
                if not name or uid in seen:
                    continue
                if should_skip_nutriscore(name):
                    continue

                price = None
                unit = ''
                xp = p.get('xprice') or []
                if xp:
                    try:
                        price = float(xp[0].get('basePrice', '').replace(',', '.'))
                    except (ValueError, AttributeError):
                        price = None
                    vol = xp[0].get('basePriceVol', '')
                    if vol:
                        unit = f"{vol}/kg"
                if price is None:
                    continue

                # Promotion info
                promo_text = ''
                discount_pct = None
                end_date = ''
                promo_until = None
                proms = p.get('promotions') or []
                if proms:
                    promo_text = (proms[0].get('strapLine') or '').strip()
                    disc = proms[0].get('discount')
                    if disc:
                        try:
                            discount_pct = int(disc)
                        except ValueError:
                            discount_pct = None
                    end = proms[0].get('endDate') or ''
                    if end:
                        end_date = f"jusqu'au {end}"
                    _, promo_until = parse_validity(str(end))

                old_price = None
                if discount_pct and price:
                    old_price = round(price / (1 - discount_pct / 100), 2)

                # Image
                img_url = ''
                thumb = p.get('thumbnail')
                if thumb:
                    img_url = COLRUYT_IMG_PREFIX + thumb.lstrip('/')

                ean = _colruyt_barcode(p.get('attributes'))

                # Parse unit price and calculate price per kg/L
                unit_price, unit_price_unit = parse_unit_price(unit)
                quantity, quantity_unit = extract_quantity_from_name(name)
                price_per_kg, price_per_l = normalize_price_per_kg_l(price, unit_price_unit, quantity, quantity_unit)

                offer = {
                    'name': name,
                    'brand': p.get('owner') or '',
                    'category': '',
                    'description': p.get('productLongName') or '',
                    'new_price': price,
                    'old_price': old_price,
                    'discount_pct': discount_pct,
                    'promo_text': f"{promo_text} {end_date}".strip(),
                    'unit': unit,
                    'unit_price': unit_price,
                    'unit_price_unit': unit_price_unit,
                    'price_per_kg': price_per_kg,
                    'price_per_l': price_per_l,
                    'image_url': img_url,
                    'source_url': f'https://www.collectandgo.be/fr/assortiment/promos?p={uid}',
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                    'ean': ean,
                }
                if promo_until:
                    offer['valid_until'] = promo_until
                offers.append(offer)
                seen.add(uid)

            print(f"Colruyt start={target_start}: {len(prods)} raw, total so far {len(offers)}")

        except Exception as e:
            print(f"Colruyt page {page} error: {e}")
            break

    print(f"Colruyt: {len(offers)} valid food offers")
    return offers


# ============ SPAR SCRAPER (Wrong URL) ============

def scrape_spar() -> List[Dict]:
    """Scrape Spar promotions"""
    # Spar URL redirects to gratisbox, not promotions
    print("Spar: No promotions page found - skipping")
    return []


# ============ ACTION SCRAPER (via promotiez.be) ============

ACTION_PROMOTIEZ_URL = 'https://www.promotiez.be/winkels/action/promoties'
ACTION_PROMOTIEZ_PAGES = 3  # Number of paginated pages to fetch
ACTION_DETAIL_BASE = 'https://www.promotiez.be'

# Dutch to French translations for common Action product terms
NL_TO_FR = {
    # Categories
    'dekbedovertrek': 'housse de couette',
    'fleece': 'polaire',
    'douchegel': 'gel douche',
    'adventskalender': 'calendrier de l\'avent',
    'batterijen': 'piles',
    'pedaalemmer': 'seau à pédale',
    'roestvrij stalen': 'acier inoxydable',
    'tekenezel': 'tableau de dessin',
    'koffie': 'café',
    'ratel- en doppenset': 'jeu de cliquets et douilles',
    'driekleurige contourpoeder': 'poudre contouring 3 couleurs',
    'muurverf': 'peinture murale',
    'vloerkleed': 'tapis',
    'imitatiebont': 'fausse fourrure',
    'trekband': 'à cordon',
    'afvalzakken': 'sacs poubelle',
    'labelprinter': 'imprimante étiquettes',
    'meubelgrepen': 'poignées de meuble',
    'hoofdkussen': 'coussin de tête',
    'gezichtsreinigingsset': 'kit nettoyant visage',
    'microvezeldoeken': 'chiffons microfibre',
    'auto-luchtverfrisser': 'parfum voiture',
    'lichaamsscrub': 'gommage corps',
    'knoopcelbatterijen': 'piles bouton',
    'opblaasbare gymnastiekmat': 'tapis gym gonflable',
    'uittrekbaar windscherm': 'pare-vent rétractable',
    'chocobrownie': 'brownie choco',
    'bloxx': 'bloxx',
    'noodradio': 'radio de secours',
    'zaklamp': 'lampe torche',
    'powerbank': 'batterie externe',
    'bloembollen': 'bulbes à fleurs',
    'verfemmer': 'godet de peinture',
    'kattenkrabpaal': 'griffoir chat',
    'wondlamp': 'applique murale',
    'ledlicht': 'lumière LED',
    'chocoladechips': 'pépites chocolat',
    'smart connect': 'connecté',
    'slimme': 'intelligent',
    'rgb vloerlamp': 'lampe sol RGB',
    'sneakersokken': 'chaussettes sneakers',
    'geurkaars': 'bougie parfumée',
    'kunstwimpers': 'faux cils',
    'hondenkauwsticks': 'bâtonnets à mâcher chien',
    'slime shaker': 'shaker slime',
    'pyjama': 'pyjama',
    'oreo wafelrolletjes': 'rouleaux gaufres Oreo',
    'vanille': 'vanille',
    'peelable gummies': 'gummies à éplucher',
    'mixed soda': 'soda mixte',
    'halloween knuffel': 'peluche Halloween',
    'heren boxershorts': 'boxers homme',
    'pantoffels': 'pantoufles',
    'kwastenset': 'set pinceaux',
    'hondensnacks': 'friandises chien',
    'jersey hoeslaken': 'drap housse jersey',
    'slimme voederbak': 'distributeur intelligent',
    'golden rolls': 'rouleaux dorés',
    'ooplbare batterijen': 'piles rechargeables',
    'verzorgingsset': 'kit soin',
    'namaste': 'namaste',
    'mini': 'mini',
    'sfeerverlichting': 'éclairage d\'ambiance',
    'comfibeds': 'comfibeds',
    'wit': 'blanc',
    'koekjes in trommel': 'biscuits en boîte',
    'ledbalk': 'barre LED',
    'afplaktape': 'ruban adhésif',
    'afdekzeil': 'bâche de protection',
    'eau de toilette': 'eau de toilette',
    'cosmetische hoofdband': 'bandeau cosmétique',
    'chewy sticks': 'bâtonnets à mâcher',
    'creamy oogschaduw': 'fard à paupières crémeux',
    'vuilniszakken': 'sacs poubelle',
    'verfroller': 'rouleau peinture',
    'telescoopsteel': 'manche télescopique',
    'wafels': 'gaufres',
    'dierenvoerbak': 'gamelle',
    'bamboe houder': 'support bambou',
    'smarties': 'smarties',
    'draadloze oordopjes': 'écouteurs sans fil',
    'vriendschapsarmband': 'bracelet amitié',
    'wooden flower puzzle': 'puzzle fleurs en bois',
    'hondensnack': 'friandise chien',
    'dentastix': 'dentastix',
    'ultraeasy vloersysteem': 'système sol ultraeasy',
    'met emmer': 'avec seau',
    # Brands
    'geribbeld': 'gaufre',
    'studio home': 'studio home',
    'vileda': 'vileda',
    'disney princess': 'disney princess',
    'varta': 'varta',
    'palazzo': 'palazzo',
    'werckmann': 'werckmann',
    'max & more': 'max & more',
    'home vision': 'home vision',
    'dumil': 'dumil',
    'fichero': 'fichero',
    'kaily beauty studio': 'kaily beauty studio',
    'little joe': 'little joe',
    'hammam': 'hammam',
    'milka': 'milka',
    'maoam': 'maoam',
    'spectrum': 'spectrum',
    'candra': 'candra',
    'bonjolie': 'bonjolie',
    'furry friends': 'furry friends',
    'so slime': 'so slime',
    'ziki': 'ziki',
    'comfibeds': 'comfibeds',
    'lsc smart connect': 'lsc smart connect',
    'golden rolls': 'golden rolls',
    'gp': 'gp',
    'verzorgingsset namaste': 'kit soin namaste',
    'lion': 'lion',
    'mr. goodlad': 'mr. goodlad',
    'baltimore': 'baltimore',
    'wooffilicious': 'wooffilicious',
    'revlon': 'revlon',
    'charlie red': 'charlie red',
    'betty\'s': 'betty\'s',
    'pinky': 'pinky',
    'dumil': 'dumil',
    'redfire': 'redfire',
    'tuinhaard': 'cheminée jardin',
    'kingston': 'kingston',
    'kracher rainbow edition': 'kracher édition arc-en-ciel',
    'verfroller': 'rouleau peinture',
    'philips': 'philips',
    'smarties': 'smarties',
    'solix': 'solix',
    'pedigree': 'pedigree',
    'ultraeasy': 'ultraeasy',
    'mentos': 'mentos',
    'adidas': 'adidas',
    # Units
    'stuks': 'pièces',
    'stuk': 'pièce',
    'rol': 'rouleau',
    'rollen': 'rouleaux',
    'pak': 'pack',
    'delig': 'pièces',
    # Validity
    'geldig': 'valable',
    't/m': 'jusqu\'au',
    'bijna geldig': 'bientôt valable',
    'dagen': 'jours',
    'dag': 'jour',
    'over': 'dans',
    'bijna': 'bientôt',
    # Misc
    'diverse kleuren': 'diverses couleurs',
    'met knoopsluiting': 'avec boutons',
    'diverse varianten': 'diverses variantes',
    'bekijk folder': 'voir prospectus',
    'andere bekeken ook': 'autres ont aussi regardé',
    'vergelijkbare promoties': 'promotions similaires',
    'dichtstbijzijnde': 'le plus proche',
    'filiaal': 'magasin',
    'jouw locatie': 'votre position',
    'is geblokkeerd': 'est bloquée',
}


def scrape_action() -> List[Dict]:
    """Scrape Action Belgium promotions from promotiez.be

    promotiez.be aggregates Action's weekly folder offers and is not Cloudflare-protected.
    Fetches detail pages for richer data (description, category, brand, validity dates).
    Fetches all 3 paginated pages. Translates Dutch to French.
    """
    offers = []
    seen = set()
    headers = {**UA, 'Accept-Language': 'fr-BE,fr;q=0.9,nl;q=0.8'}

    for page in range(1, ACTION_PROMOTIEZ_PAGES + 1):
        page_url = f'{ACTION_PROMOTIEZ_URL}?sort=promo_popular_views_weekly_alpha&page={page}'
        try:
            r = requests.get(page_url, headers=headers, timeout=30)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')

            # Find all offer tiles: links with js-offer-link-item class
            offer_tiles = soup.select('a.js-offer-link-item')
            # Sélecteur de secours si la structure change à nouveau
            if not offer_tiles:
                offer_tiles = soup.select('a[href*="/winkels/action/promoties/"]')
            if not offer_tiles:
                # Plus de pages (site en JS / fin de pagination) : on s'arrête
                # sans erreur — le pipeline conserve l'ancien volume si vide.
                print(f"  Action page {page}: aucune offre dans le HTML — arrêt de la pagination")
                break

            for tile in offer_tiles:
                try:
                    # Name from .product__name element or title attribute
                    name_el = tile.select_one('.product__name')
                    name = name_el.get_text(strip=True) if name_el else tile.get('title', '').replace('Action ', '').replace(' aanbieding', '').strip()
                    if not name or name in seen:
                        continue
                    if should_skip_nutriscore(name):
                        continue
                    seen.add(name)

                    # Price: look for .product__price-offer
                    price_el = tile.select_one('.product__price-offer')
                    new_price = None
                    if price_el:
                        price_text = price_el.get_text(strip=True)
                        new_price = parse_price(price_text)

                    # Original price (if crossed out)
                    old_price = None
                    normal_price_el = tile.select_one('.product__price-normal')
                    if normal_price_el:
                        price_text = normal_price_el.get_text(strip=True)
                        old_price = parse_price(price_text)

                    # Discount percentage
                    discount_pct = None
                    if old_price and new_price and old_price > new_price:
                        discount_pct = round((1 - new_price / old_price) * 100)

                    # Image - use larger thumbWebP version if available
                    img_url = ''
                    img_el = tile.select_one('.product__image img')
                    if img_el:
                        img_url = img_el.get('src') or img_el.get('data-src') or ''
                    if img_url and 'thumbSmallWebP' in img_url:
                        img_url = img_url.replace('thumbSmallWebP', 'thumbWebP')

                    # Product URL (detail page) - construct from data-offer-id and name
                    source_url = ''
                    offer_id = tile.get('data-offer-id', '')
                    if offer_id:
                        slug = name.lower()
                        slug = re.sub(r'[^a-z0-9]+', '-', slug)
                        slug = slug.strip('-')
                        source_url = f'{ACTION_DETAIL_BASE}/winkels/action/promoties/{slug}-promotie-{offer_id}/'
                    else:
                        href = tile.get('href', '')
                        if href:
                            source_url = href if href.startswith('http') else ACTION_DETAIL_BASE + href

                    # Validity (days remaining)
                    promo_text = ''
                    date_el = tile.select_one('.product-date')
                    if date_el:
                        promo_text = date_el.get_text(strip=True)

                    if new_price is None:
                        continue

                    # Fetch detail page for richer data
                    detail = {}
                    if source_url:
                        detail = fetch_action_detail(source_url, headers)
                        time.sleep(0.1)  # be polite

                    # Use detail old_price if list page didn't have it
                    final_old_price = old_price or detail.get('old_price')
                    discount_pct = None
                    if final_old_price and new_price and final_old_price > new_price:
                        discount_pct = round((1 - new_price / final_old_price) * 100)

                    offer = {
                        'name': translate_to_french(name),
                        'brand': translate_to_french(detail.get('brand', '')),
                        'category': translate_to_french(detail.get('category', 'Non-food')),
                        'description': translate_to_french(detail.get('description', '')),
                        'new_price': new_price,
                        'old_price': final_old_price,
                        'discount_pct': discount_pct,
                        'promo_text': translate_to_french(detail.get('validity', promo_text)),
                        'unit': translate_to_french(detail.get('unit', '')),
                        'image_url': detail.get('image_url', img_url),
                        'source_url': source_url,
                        'fetched_at': datetime.utcnow().isoformat() + 'Z',
                        'ean': detail.get('ean'),
                    }
                    promo_from, promo_until = parse_validity(offer['promo_text'])
                    if promo_until:
                        offer['valid_until'] = promo_until
                    if promo_from:
                        offer['valid_from'] = promo_from
                    
                    # Extract quantity and calculate price per kg/L
                    qty, qty_unit = extract_quantity_from_name(offer['name'])
                    ppg, ppl = normalize_price_per_kg_l(new_price, None, qty, qty_unit)
                    offer['price_per_kg'] = ppg
                    offer['price_per_l'] = ppl
                    offers.append(offer)

                except Exception as e:
                    print(f"Error parsing Action tile: {e}")
                    continue

            time.sleep(0.5)  # be polite between pages

        except Exception as e:
            print(f"Action page {page} scrape error: {e}")

    print(f"Action: {len(offers)} valid offers")
    return offers


def translate_to_french(text: str) -> str:
    """Translate Dutch product names/descriptions to French using dictionary."""
    if not text:
        return text
    result = text
    # Sort by length descending to match longer phrases first
    for nl, fr in sorted(NL_TO_FR.items(), key=lambda x: -len(x[0])):
        # Case-insensitive replacement preserving original case for first letter
        import re
        pattern = re.compile(re.escape(nl), re.IGNORECASE)
        def repl(match):
            matched = match.group()
            if matched[0].isupper():
                return fr.capitalize()
            return fr
        result = pattern.sub(repl, result)
    return result


def fetch_action_detail(url: str, headers: Dict) -> Dict:
    """Fetch detail page for an Action offer to get description, category, brand, etc."""
    detail = {}
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')

        # Description - from .offer-description
        desc_el = soup.select_one('.offer-description')
        if desc_el:
            detail['description'] = desc_el.get_text(strip=True)

        # Category - from product keyword pills (e.g., "Mentos", "Kauwgom")
        cat_pills = soup.select('.product-keyword-pill, .js-product-keyword-pill')
        if cat_pills:
            categories = []
            for p in cat_pills:
                text = p.get_text(strip=True)
                # Remove leading numbers (IDs)
                text = re.sub(r'^\d+', '', text).strip()
                if text:
                    categories.append(text)
            if categories:
                detail['category'] = ' > '.join(categories[:3])

        # Validity - from .offer-header
        validity_el = soup.select_one('.offer-header, .offer-header--mobile')
        if validity_el:
            detail['validity'] = validity_el.get_text(strip=True)

        # Better image from detail page - main offer image is in .offer-image container
        img_el = soup.select_one('.offer-image img')
        if img_el:
            img_src = img_el.get('src') or img_el.get('data-src') or ''
            if img_src and img_src.startswith('http'):
                # Upgrade to larger version if it's a small thumbnail
                if 'thumbSmallWebP' in img_src:
                    img_src = img_src.replace('thumbSmallWebP', 'thumbWebP')
                detail['image_url'] = img_src

        # Unit/quantity - from .offer-info
        info_el = soup.select_one('.offer-info')
        if info_el:
            info_text = info_el.get_text(strip=True)
            # Extract quantity/unit info (e.g., "Kauwgom: 90 stuks (22,86/kg)")
            qty_match = re.search(r'(\d+\s*(?:stuks?|st|kg|g|ml|l|rollen?|pak|stuks?))', info_text, re.IGNORECASE)
            if qty_match:
                detail['unit'] = qty_match.group(1)
            # Also try to get unit price
            unit_price_match = re.search(r'\(([^)]+/(?:kg|g|ml|l|st))\)', info_text)
            if unit_price_match:
                if detail.get('unit'):
                    detail['unit'] += f' ({unit_price_match.group(1)})'
                else:
                    detail['unit'] = unit_price_match.group(1)

        # Brand - first keyword without numbers
        if cat_pills:
            first = cat_pills[0].get_text(strip=True)
            detail['brand'] = re.sub(r'^\d+', '', first).strip()

        # Old price - from .offer__price .product__price-normal on detail page
        old_price_el = soup.select_one('.offer__price .product__price-normal, .offer .product__price-normal')
        if old_price_el:
            price_text = old_price_el.get_text(strip=True)
            old_price = parse_price(price_text)
            if old_price:
                detail['old_price'] = old_price

        # EAN/barcode - not typically available on promotiez.be
        # But check for any data attributes
        ean_el = soup.select_one('[data-ean], [data-barcode], [data-gtin]')
        if ean_el:
            ean = ean_el.get('data-ean') or ean_el.get('data-barcode') or ean_el.get('data-gtin')
            if ean and ean.isdigit() and len(ean) >= 8:
                detail['ean'] = ean

    except Exception as e:
        print(f"Action detail fetch error for {url}: {e}")

    return detail


# ============ MAIN EXPORTS ============

STORE_SCRAPERS = {
    'aldi': scrape_aldi,
    'carrefour': scrape_carrefour,
    'delhaize': scrape_delhaize,
    'lidl': scrape_lidl,
    'colruyt': scrape_colruyt,
    'spar': scrape_spar,
    'action': scrape_action,
}