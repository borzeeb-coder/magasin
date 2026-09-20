import json

with open('data/promos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

offers = data.get('offers', {})
for store, store_offers in offers.items():
    with_kg = sum(1 for o in store_offers if o.get('price_per_kg') is not None)
    with_l = sum(1 for o in store_offers if o.get('price_per_l') is not None)
    total = len(store_offers)
    print('{}: {} offers, {} with price_per_kg, {} with price_per_l'.format(store, total, with_kg, with_l))

# Show some examples
print()
for store in ['aldi', 'carrefour', 'delhaize', 'colruyt']:
    offers_list = offers.get(store, [])
    with_data = [o for o in offers_list if o.get('price_per_kg') is not None or o.get('price_per_l') is not None]
    if with_data:
        print(store + ' examples:')
        for o in with_data[:3]:
            name = o['name'][:40]
            ppg = o.get('price_per_kg')
            ppl = o.get('price_per_l')
            if ppg is None:
                ppg = 0
            if ppl is None:
                ppl = 0
            print('  {}: {}EUR -> {:.2f}/kg, {:.2f}/L'.format(name, o['new_price'], ppg, ppl))