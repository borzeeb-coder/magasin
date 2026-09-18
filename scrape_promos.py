#!/usr/bin/env python3
"""
scrape_promos.py
-----------------
Va chercher les promotions actuelles de quelques enseignes belges sur
promopromo.be et écrit le résultat dans data/promos.json.

Conçu pour tourner chaque nuit via GitHub Actions (voir
.github/workflows/update-promos.yml), mais peut aussi être lancé à la main :

    pip install requests beautifulsoup4
    python scrape_promos.py

IMPORTANT :
promopromo.be est une application Nuxt (rendue côté serveur), donc son HTML
change de structure de temps en temps. Ce script cible des motifs robustes
(liens contenant "?offer=", prix au format "€ 1,23") plutôt que des classes
CSS précises, mais si promopromo.be change son site, il faudra probablement
ajuster les sélecteurs ci-dessous en inspectant la page dans un navigateur
(clic droit → Inspecter sur une carte de promo).

Usage respectueux : ce script ne fait qu'une poignée de requêtes par nuit
(une par enseigne) et respecte un délai entre les requêtes. Vérifiez le
fichier robots.txt et les CGU de promopromo.be avant un usage intensif ou
commercial.
"""

from __future__ import annotations

import json
import re
import sys
import time
import traceback
from dataclasses import dataclass, asdict
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PromoAppMarcheBot/1.0; +https://github.com/)"
}

# Enseignes ciblées : slug promopromo.be -> infos magasin locales (Marche-en-Famenne)
STORES = {
    "colruyt":   {"name": "Colruyt",   "emoji": "🔴", "color": "#DE3B24", "addr": "Chaussée de Liège, Marche",      "dist": 0.45},
    "delhaize":  {"name": "Delhaize",  "emoji": "🦁", "color": "#C8102E", "addr": "Rue du Luxembourg, Marche",      "dist": 0.9},
    "carrefour": {"name": "Carrefour", "emoji": "🔵", "color": "#0057B8", "addr": "Rue des Tanneurs, Marche",       "dist": 1.3},
    "lidl":      {"name": "Lidl",      "emoji": "🟡", "color": "#F4B400", "addr": "Route de Bastogne, Marche",      "dist": 1.7},
    "aldi":      {"name": "Aldi",      "emoji": "🔷", "color": "#1B6FB5", "addr": "Chaussée de l'Ourthe, Marche",   "dist": 2.1},
    "spar":      {"name": "Spar",      "emoji": "🟢", "color": "#00843D", "addr": "Rue de Bastogne, Marche",        "dist": 1.1},
    "intermarche":{"name": "Intermarché","emoji": "🟠", "color": "#E8590C", "addr": "Route de Libramont, Marche",  "dist": 1.5},
}

BASE_URL = "https://www.promopromo.be/fr/{slug}/folder-offres"

PRICE_RE = re.compile(r"€\s*([\d.,]+)")
DISCOUNT_RE = re.compile(r"(\d+)\s*%")

# Images "aliments" (logo produit) attribuées selon le nom du produit,
# à la place des logos génériques d'enseigne récupérés par le scraping.
FOOD_IMAGES = [
    (re.compile(r"poulet|volaille|entrecôte|côtelette|côte|cote|steak|bœuf|boeuf|viande|saucisse|jambon|agneau|cailles|lapin|veau|hachis|merguez|escalope|lard|boucher|porc"),  # noqa: E501
     "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"saumon|poisson|crevette|cabillaud|thon|truite|moule|crustacé|fruits de mer|surimi|bar|sole|dorade"),  # noqa: E501
     "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"fraise|pomme|banane|avocat|tomate|poire|raisin|cerise|abricot|pêche|peche|melon|pastèque|ananas|mangue|kiwi|orange|clémentine|mandarine|pamplemousse|chicon|endive|carotte|brocoli|courgette|poivron|salade|laitue|épinard|champignon|butternut|fruits|légume|legume|petits pois|épinards"),  # noqa: E501
     "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"fromage|yaourt|mozzarella|brie|camembert|emmental|comté|roquefort|chèvre|chevre|bûche|buche|gouda|edam|parmesan|ricotta|mascarpone|crème|creme|lait battu|dessert|beurre|lait|œuf|oeuf|raclette|milk"),  # noqa: E501
     "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"pain|croissant|brioche|baguette|viennoiserie|chocolat pur|boulangerie|biscotte|pain turc"),  # noqa: E501
     "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"café|cafe|thé|the|chocolat|cacao|pâtes|pates|riz|farine|sucre|huile|vinaigre|confiture|conserves|sauce|moutarde|mayonnaise|pesto|soupe|bouillon|épices|céréales|cereales|granola|muesli|cruesli|chips|biscuit|cookie|cake|bonbon"),  # noqa: E501
     "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80"),
    (re.compile(r"jus|nectar|boisson|soda|eau|bière|biere|vin|champagne|cidre|limonade|ice tea|sirop"),  # noqa: E501
     "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80"),
]

DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"


def food_image_for(name: str) -> str:
    """Choisit une image alimentaire pertinente selon le nom du produit."""
    n = name.lower()
    for regex, url in FOOD_IMAGES:
        if regex.search(n):
            return url
    return DEFAULT_FOOD_IMAGE


@dataclass
class Offer:
    store: str
    name: str
    old_price: float | None
    new_price: float | None
    discount_pct: int | None
    image_url: str | None
    source_url: str


def parse_price(text: str) -> float | None:
    m = PRICE_RE.search(text)
    if not m:
        return None
    return float(m.group(1).replace(".", "").replace(",", "."))


# Préfixes "d'accroche" retirés du nom du produit pour ne garder que le nom réel.
# Ex : "25% de remise Sauce tomate" -> "Sauce tomate"
DISCOUNT_PREFIX_RE = re.compile(
    r"^\s*(?:\d+\s*%\s*(?:de\s*remise|d'economie|de repos|sur)?\s*|"
    r"(?:2e|2ème|2eme|seconde?|autre)\s*(?:achat|article|produit)?\s*(?:à|a)\s*-?\d+\s*%\s*|"
    r"(?:1\+1|2\+1|3\+2)\s*(?:gratuit|offert|gratuits|offerts|offerte)\s*|"
    r"\d+\s*(?:x|article)s?\s*(?:pour|à)\s*|"
    r"-?\d+\s*%\s*)",
    re.IGNORECASE,
)


def clean_product_name(text: str) -> str:
    """Extrait et nettoie le nom du produit depuis le texte d'une offre."""
    # On coupe au premier prix, sinon toute la chaîne
    name = re.split(r"€|€\s*$", text)[0]
    # Si un motif "X% de remise" introduit le nom, on le retire
    name = DISCOUNT_PREFIX_RE.sub("", name, count=1)
    name = re.sub(r"\s*-\s*$", "", name)
    name = re.sub(r"\s+", " ", name).strip(" -:;")
    return name


def infer_prices(text: str) -> tuple[float | None, float | None, int | None]:
    """Renvoie (old_price, new_price, discount_pct) en exploitant toutes les
    infos disponibles : 2 prix explicites, ou 1 prix + un pourcentage de remise
    (ex: '50% de remise ... € 6,45' -> ancien prix déduit ≈ 12,90)."""
    prices = [float(p.replace(".", "").replace(",", ".")) for p in PRICE_RE.findall(text)]
    disc_match = DISCOUNT_RE.search(text)
    discount_pct = int(disc_match.group(1)) if disc_match else None

    if len(prices) >= 2:
        old_price, new_price = max(prices), min(prices)
        if discount_pct is None and old_price:
            discount_pct = round((1 - new_price / old_price) * 100)
        return old_price, new_price, discount_pct

    if len(prices) == 1:
        new_price = prices[0]
        if discount_pct and 0 < discount_pct < 100:
            old_price = round(new_price / (1 - discount_pct / 100), 2)
            return old_price, new_price, discount_pct
        return None, new_price, discount_pct

    return None, None, discount_pct


def scrape_store(slug: str) -> list[Offer]:
    url = BASE_URL.format(slug=slug)
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding or "utf-8"
    soup = BeautifulSoup(resp.text, "html.parser")

    offers: list[Offer] = []
    seen_names: set[str] = set()

    # Chaque offre est un lien dont l'URL contient "?offer=" sur promopromo.be
    for link in soup.select('a[href*="?offer="]'):
        text = " ".join(link.stripped_strings)
        if not text:
            continue

        name = clean_product_name(text)
        if not name:
            continue
        if name in seen_names:
            continue
        seen_names.add(name)

        old_price, new_price, discount_pct = infer_prices(text)

        offers.append(Offer(
            store=slug,
            name=name,
            old_price=old_price,
            new_price=new_price,
            discount_pct=discount_pct,
            image_url=food_image_for(name),
            source_url=url,
        ))

    return offers


def write_output(all_offers: dict, errors: list[str]) -> None:
    output = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "stores_meta": STORES,
        "offers": all_offers,
        "errors": errors,
    }
    out_path = Path(__file__).resolve().parent / "data" / "promos.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ écrit {out_path} ({sum(len(v) for v in all_offers.values())} offres au total)", file=sys.stderr)


def main() -> int:
    all_offers: dict = {}
    errors: list[str] = []

    for slug in STORES:
        try:
            print(f"→ scraping {slug} …", file=sys.stderr)
            offers = scrape_store(slug)
            all_offers[slug] = [asdict(o) for o in offers]
            print(f"  {len(offers)} offres trouvées", file=sys.stderr)
        except Exception as exc:  # on veut continuer les autres enseignes même si une échoue
            print(f"  ⚠ échec pour {slug} : {exc}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            errors.append(f"{slug}: {exc}")
            all_offers[slug] = []
        time.sleep(2)  # on reste courtois avec le serveur

    # On écrit toujours un fichier, même s'il est vide, pour que le commit
    # nocturne ne casse jamais complètement le site.
    write_output(all_offers, errors)

    # Le job ne doit jamais faire échouer le workflow : une nuit sans offre
    # récupérée doit juste laisser les anciennes données en place (ou un
    # fichier avec des erreurs listées), pas empêcher le commit suivant.
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Filet de sécurité ultime : on ne veut jamais un crash silencieux
        # sans fichier écrit. On log l'erreur complète et on écrit un JSON
        # minimal pour que l'app garde au moins ses données de secours.
        print("✗ Erreur inattendue dans le scraper :", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        try:
            write_output({}, ["erreur fatale du scraper — voir les logs GitHub Actions"])
        except Exception:
            pass
        sys.exit(0)
