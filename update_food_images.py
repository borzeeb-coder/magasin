#!/usr/bin/env python3
"""
Update promos.json with actual food/product images from Unsplash
based on product names and categories.
"""

import json
import re

# Food image mappings based on keywords in product names
FOOD_IMAGES = {
    # Meat/Poultry
    r'poulet|volaille|entrecôte|côtelette|steak|bœuf|boeuf|viande|saucisse|jambon|agneau|cailles|lapin|filet.*porc|hachis|merguez|chipolata': 
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80',
    
    # Fish/Seafood
    r'saumon|poisson|crevette|cabillaud|thon|truite|moule|crustacé|fruits de mer|crevettes|filet.*saumon|dos de cabillaud':
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80',
    
    # Fruits
    r'fraise|pomme|banane|avocat|tomate|poire|raisin|cerise|abricot|pêche|melon|pastèque|ananas|mangue|kiwi|orange|clémentine|mandarine|pamplemousse|chicons|endives|carotte|brocoli|courgette|poivron|salade|laitue|épinard|champignon|champignons':
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
    
    # Dairy/Cheese
    r'fromage|yaourt|mozzarella|brie|camembert|emmental|comté|roquefort|chèvre|bûche|gouda|edam|parmesan|ricotta|mascarpone|crème|beurre|lait|œuf|oeuf|beurre|lait battu|crème dessert':
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80',
    
    # Bakery
    r'pain|croissant|brioche|baguette|viennoiserie|pains au chocolat|pains au lait|boulangerie|biscotte|grille|toast':
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    
    # Pantry/Grocery
    r'café|cafe|thé|the|chocolat|cacao|pâtes|pates|riz|farine|sucre|huile|vinaigre|miel|confiture|conserve|boîte|conserve|sauce|ketchup|moutarde|mayonnaise|pesto|soupes?|bouillon|épices|herbes':
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    
    # Beverages
    r'jus|nectar|boisson|soda|eau|bière|biere|vin|champagne|cidre|jus de|nectar|limonade|ice tea|thé glacé':
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    
    # Frozen
    r'surgelé|congelé|glace|sorbet|frites|fritures|pizza|tarte|quiche|plat préparé|surimi|bâtonnets':
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    
    # Snacks
    r'chips|chips|biscuit|cookie|gâteau|cake|barre|céréales|cereales|granola|muesli|chocolat|bonbon|confiserie|croustillant':
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=80',
    
    # Specific products from the data
    r'croissant fourré|cordon-bleu|lard|épinards|pain turc|corte aurelio|ice tea|filet de saumon|saumon sans peau':
        'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&auto=format&fit=crop&q=80',
    
    # Default fallback
    'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
}

def get_food_image(product_name):
    """Get appropriate food image URL based on product name."""
    name_lower = product_name.lower()
    
    for pattern, url in FOOD_IMAGES.items():
        if pattern == 'default':
            continue
        if re.search(pattern, name_lower, re.IGNORECASE):
            return url
    
    return FOOD_IMAGES['default']

def main():
    # Load current promos.json
    with open('data/promos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update each offer with appropriate food image
    for store_slug, offers in data['offers'].items():
        for offer in offers:
            if 'image_url' in offer:
                offer['image_url'] = get_food_image(offer['name'])
                print(f"Updated: {offer['name'][:50]} -> {offer['image_url'][:60]}...")
    
    # Save updated promos.json
    with open('data/promos.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Updated {sum(len(v) for v in data['offers'].values())} offers with food images")

if __name__ == '__main__':
    main()