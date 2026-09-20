import requests
import json

# Try common Lidl API endpoints
endpoints = [
    'https://www.lidl.be/api/catalog/v1/products?category=offers-week&limit=100',
    'https://www.lidl.be/api/v1/products?category=offers-week&limit=100',
    'https://www.lidl.be/api/catalog/products?filters[categories]=offers-week&limit=100',
    'https://mobileapi.lidl.com/v1/products?category=offers-week&limit=100',
    'https://www.lidl.be/c/fr-BE/offres-de-la-semaine/a10082242?format=json',
    'https://www.lidl.be/api/v2/catalog/products?category=offers-week&lang=fr-BE&limit=100',
    'https://www.lidl.be/graphql',
]

UA = {'User-Agent': 'PromoApp/1.0', 'Accept': 'application/json'}

for ep in endpoints:
    try:
        r = requests.get(ep, headers=UA, timeout=15)
        print(f'{r.status_code} {ep}')
        if r.status_code == 200:
            try:
                data = r.json()
                print(f'  JSON keys: {list(data.keys()) if isinstance(data, dict) else "list"}')
                if isinstance(data, dict):
                    for k, v in data.items():
                        if isinstance(v, list) and v:
                            print(f'  {k}: list[{len(v)}] first keys: {list(v[0].keys()) if v and isinstance(v[0], dict) else "N/A"}')
            except:
                print(f'  Not JSON: {r.text[:200]}')
    except Exception as e:
        print(f'ERROR {ep}: {e}')
    print()