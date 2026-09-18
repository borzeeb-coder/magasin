#!/usr/bin/env python3
"""
Store-specific scrapers for Belgian supermarkets
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
import re
import time

UA = {'User-Agent': 'PromoApp/1.0 (https://github.com/borzeeb-coder/magasin)'}

def scrape_colruyt():
    """Scrape Colruyt promotions"""
    url = 'https://www.colruyt.be/promotions'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    # Colruyt uses specific selectors - adjust based on actual HTML
    products = soup.select('.product-tile, .promo-item, [data-testid="product-card"]')
    
    for p in products[:20]:  # Limit
        try:
            name = p.select_one('.product-name, h3, .title')
            price = p.select_one('.price, .promo-price, .current-price')
            old_price = p.select_one('.old-price, .was-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'old_price': parse_price(old_price.get_text(strip=True)) if old_price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except Exception as e:
            continue
    
    return offers

def scrape_delhaize():
    """Scrape Delhaize promotions"""
    url = 'https://www.delhaize.be/fr-be/promotions'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    # Delhaize specific selectors
    products = soup.select('.product-card, .promotion-item, .product-tile')
    
    for p in products[:20]:
        try:
            name = p.select_one('.product-title, h3, .name')
            price = p.select_one('.price-value, .promo-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except:
            continue
    
    return offers

def scrape_carrefour():
    """Scrape Carrefour promotions"""
    url = 'https://www.carrefour.be/fr/promotions'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    products = soup.select('.product-card, .promo-product, .item-product')
    
    for p in products[:20]:
        try:
            name = p.select_one('.product-name, .title, h3')
            price = p.select_one('.price, .promo-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except:
            continue
    
    return offers

def scrape_lidl():
    """Scrape Lidl promotions"""
    url = 'https://www.lidl.be/c/nos-promotions'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    products = soup.select('.product-grid-item, .product-tile, .promotion-item')
    
    for p in products[:20]:
        try:
            name = p.select_one('.product-name, .title')
            price = p.select_one('.price, .current-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except:
            continue
    
    return offers

def scrape_aldi():
    """Scrape Aldi promotions"""
    url = 'https://www.aldi.be/fr/promotions.html'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    products = soup.select('.product-tile, .promo-item, .product-card')
    
    for p in products[:20]:
        try:
            name = p.select_one('.product-name, .title, h3')
            price = p.select_one('.price, .promo-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except:
            continue
    
    return offers

def scrape_spar():
    """Scrape Spar promotions"""
    url = 'https://www.spar.be/promotions'
    r = requests.get(url, headers=UA, timeout=20)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    offers = []
    products = soup.select('.product-item, .promo-product, .product-card')
    
    for p in products[:20]:
        try:
            name = p.select_one('.product-title, .name, h3')
            price = p.select_one('.price, .promo-price')
            img = p.select_one('img')
            
            if name:
                offer = {
                    'name': name.get_text(strip=True),
                    'new_price': parse_price(price.get_text(strip=True)) if price else None,
                    'image_url': img.get('src') or img.get('data-src') if img else '',
                    'source_url': url,
                    'fetched_at': datetime.utcnow().isoformat() + 'Z',
                }
                offers.append(offer)
        except:
            continue
    
    return offers

def parse_price(text):
    """Parse price from text like '2,99 €' or '€ 2.99'"""
    if not text:
        return None
    # Remove currency symbols and normalize
    text = text.replace('€', '').replace('EUR', '').strip()
    text = text.replace(',', '.')
    # Extract first number
    match = re.search(r'[\d.]+', text)
    if match:
        try:
            return float(match.group())
        except:
            pass
    return None

# Import datetime for scrapers
from datetime import datetime

# Export all scrapers
STORE_SCRAPERS = {
    'colruyt': scrape_colruyt,
    'delhaize': scrape_delhaize,
    'carrefour': scrape_carrefour,
    'lidl': scrape_lidl,
    'aldi': scrape_aldi,
    'spar': scrape_spar,
}