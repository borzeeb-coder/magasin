import requests
from bs4 import BeautifulSoup
import re, json, html

UA = {'User-Agent': 'PromoApp/1.0'}
url = 'https://www.lidl.be/c/fr-BE/offres-de-la-semaine/a10082242'
r = requests.get(url, headers=UA, timeout=30)
print('Status:', r.status_code)
soup = BeautifulSoup(r.text, 'html.parser')
tiles = soup.select('a.js-offer-link-item, [data-grid-data]')
print('Tiles found:', len(tiles))
grid_data = re.findall(r'data-grid-data="(.+?)"', r.text)
print('data-grid-data matches:', len(grid_data))
if grid_data:
    for i, g in enumerate(grid_data[:2]):
        try:
            d = json.loads(html.unescape(g))
            print(f'  Tile {i}:', d.get('title', 'N/A'), d.get('price', {}))
        except Exception as e:
            print(f'  Tile {i} parse error:', e)

# Also check for other patterns
for el in soup.find_all(class_=True):
    classes = el.get('class')
    if classes:
        for c in classes:
            if 'product' in c.lower() or 'offer' in c.lower() or 'tile' in c.lower() or 'grid' in c.lower():
                print('Class:', c, '->', el.get_text(strip=True)[:80])
                break