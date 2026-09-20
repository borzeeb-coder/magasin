import requests
import re

# Try to get the page and find the actual API calls
UA = {'User-Agent': 'PromoApp/1.0'}

# Try to find the weekly offers page with different parameters
url = 'https://www.lidl.be/c/fr-BE/offres-de-la-semaine/a10082242'
r = requests.get(url, headers=UA, timeout=30)

# Look for API calls in the page source
# Search for fetch, xhr, api, graphql patterns
patterns = [
    r'fetch\([\'"]([^\'"]+)[\'"]',
    r'axios\.[get|post]+\([\'"]([^\'"]+)[\'"]',
    r'api\.lidl\.[^"\s]+',
    r'graphql',
    r'product.*?api',
    r'catalog.*?api',
]

for pattern in patterns:
    matches = re.findall(pattern, r.text, re.IGNORECASE)
    if matches:
        print(f'Pattern {pattern}: {list(set(matches))[:10]}')

# Also check for data in window.__INITIAL_STATE__ or similar
state_patterns = [
    r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});',
    r'window\.__DATA__\s*=\s*(\{.*?\});',
    r'window\.__APP_STATE__\s*=\s*(\{.*?\});',
]

for pattern in state_patterns:
    matches = re.findall(pattern, r.text, re.DOTALL)
    if matches:
        for m in matches[:2]:
            try:
                data = json.loads(m)
                print('Found state:', list(data.keys())[:10])
            except:
                print('Found state (not JSON):', m[:200])

# Try the Lidl API that might be used for weekly offers
# Often they use a specific endpoint for the weekly folder
print('\n--- Trying known Lidl endpoints ---')
lidl_endpoints = [
    'https://www.lidl.be/api/catalog/v1/folders/a10082242/products?limit=100',
    'https://www.lidl.be/api/v1/folders/a10082242/products?limit=100',
    'https://www.lidl.be/api/catalog/folders/offres-de-la-semaine/products?limit=100',
    'https://www.lidl.be/api/v1/catalog/folder/a10082242/products?limit=100',
    'https://www.lidl.be/api/v2/folders/a10082242/products?limit=100',
    'https://www.lidl.be/pwa/api/catalog/v1/products?folder=a10082242&limit=100',
    'https://www.lidl.be/pwa/api/v1/products?folder=offres-de-la-semaine&limit=100',
]

for ep in lidl_endpoints:
    try:
        r = requests.get(ep, headers={'User-Agent': 'PromoApp/1.0', 'Accept': 'application/json'}, timeout=10)
        print(f'{r.status_code} {ep}')
        if r.status_code == 200:
            try:
                data = r.json()
                if isinstance(data, dict):
                    for k, v in data.items():
                        if isinstance(v, list) and v:
                            print(f'  {k}: list[{len(v)}] keys: {list(v[0].keys()) if v and isinstance(v[0], dict) else "N/A"}')
                        elif isinstance(v, dict):
                            print(f'  {k}: dict keys: {list(v.keys())[:10]}')
                elif isinstance(data, list) and data:
                    print(f'  List[{len(data)}] keys: {list(data[0].keys()) if isinstance(data[0], dict) else "N/A"}')
            except:
                pass
    except Exception as e:
        pass