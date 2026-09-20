import requests
from bs4 import BeautifulSoup
import re, json

# Try promopromo.be for Lidl (used in original scrape_promos.py)
UA = {'User-Agent': 'PromoApp/1.0'}

url = 'https://www.promopromo.be/fr/lidl/folder-offres'
r = requests.get(url, headers=UA, timeout=30)
print('promopromo.be status:', r.status_code)
soup = BeautifulSoup(r.text, 'html.parser')

# Look for offer links
offer_links = soup.select('a[href*="?offer="]')
print(f'Offer links found: {len(offer_links)}')
for link in offer_links[:3]:
    text = ' '.join(link.stripped_strings)
    print(f'  {text[:150]}')

# Also try the Lidl page with different user agent or accept headers
# Check if there's a different way to get the data
print('\n--- Trying with different headers ---')
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-BE,fr;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}
r = requests.get('https://www.lidl.be/c/fr-BE/offres-de-la-semaine/a10082242', headers=headers, timeout=30)
soup = BeautifulSoup(r.text, 'html.parser')

# Check for any product data in script tags
scripts = soup.find_all('script')
for s in scripts:
    if s.string and ('product' in s.string.lower() or 'price' in s.string.lower()):
        content = s.string
        if 'ABaseContentTile' in content or 'product' in content.lower():
            # Try to find JSON data
            json_matches = re.findall(r'(\{.*?"price".*?\})', content)
            for m in json_matches[:5]:
                try:
                    data = json.loads(m)
                    if 'price' in data:
                        print('Found price data:', data)
                except:
                    pass

# Also look for __NEXT_DATA__ with different id
for script in soup.find_all('script'):
    if script.get('id') in ['__NEXT_DATA__', '__NEXT_DATA__', 'NEXT_DATA', '__INITIAL_STATE__']:
        print(f'Found {script.get("id")}')
        try:
            data = json.loads(script.string)
            print('Keys:', list(data.keys())[:10])
        except:
            pass