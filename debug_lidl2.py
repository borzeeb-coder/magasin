import requests
from bs4 import BeautifulSoup
import re, json, html

UA = {'User-Agent': 'PromoApp/1.0'}
url = 'https://www.lidl.be/c/fr-BE/offres-de-la-semaine/a10082242'
r = requests.get(url, headers=UA, timeout=30)
soup = BeautifulSoup(r.text, 'html.parser')

# Check for __NEXT_DATA__ or similar
next_data = soup.find('script', id='__NEXT_DATA__')
if next_data:
    print('__NEXT_DATA__ found')
    try:
        data = json.loads(next_data.string)
        # Navigate to products
        def find_products(obj, path=''):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    new_path = f'{path}.{k}'
                    if k.lower() in ['product', 'products', 'offer', 'offers', 'item', 'items', 'tile', 'tiles']:
                        print(f'  Found {k} at {new_path}: {type(v)}')
                        if isinstance(v, list) and v:
                            print(f'    First item keys: {list(v[0].keys()) if v and isinstance(v[0], dict) else "N/A"}')
                        if isinstance(v, dict):
                            print(f'    Keys: {list(v.keys())}')
                    find_products(v, new_path)
            elif isinstance(obj, list):
                for i, v in enumerate(obj):
                    find_products(v, f'{path}[{i}]')
        find_products(data)
    except Exception as e:
        print('NEXT_DATA parse error:', e)

# Check for API endpoints in page
print('\n--- Searching for API URLs ---')
api_urls = re.findall(r'https?://[^"\s]*(?:api|graphql|product|offer)[^"\s]*', r.text)
for u in list(set(api_urls))[:15]:
    print(' ', u)

# Look for product data in any script
scripts = soup.find_all('script')
for s in scripts:
    if s.string and ('product' in s.string.lower() or 'offer' in s.string.lower()):
        content = s.string[:500]
        if 'price' in content.lower() or 'price' in content.lower():
            print('Script with product/price:', content[:200])
            print('---')