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

import json
import re
import sys
import time
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
}

BASE_URL = "https://www.promopromo.be/fr/{slug}/folder-offres"

PRICE_RE = re.compile(r"€\s*([\d.,]+)")
DISCOUNT_RE = re.compile(r"(\d+)\s*%")


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


def scrape_store(slug: str) -> list[Offer]:
    url = BASE_URL.format(slug=slug)
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    offers: list[Offer] = []

    for link in soup.select('a[href*="?offer="]'):
        text = " ".join(link.stripped_strings)
        if not text:
            continue

        name_match = re.search(r"Offre\s*:\s*(.+?)(?:€|\d+\s*%|$)", text)
        name = name_match.group(1).strip() if name_match else text.split("€")[0].strip()
        name = re.sub(r"\s+", " ", name).strip(" -")
        if not name:
            continue

        prices = PRICE_RE.findall(text)
        prices = [float(p.replace(".", "").replace(",", ".")) for p in prices]
        old_price = prices[0] if len(prices) >= 2 else None
        new_price = prices[-1] if prices else None

        disc_match = DISCOUNT_RE.search(text)
        discount_pct = int(disc_match.group(1)) if disc_match else None

        img_tag = link.find("img")
        image_url = None
        if img_tag:
            image_url = img_tag.get("src") or img_tag.get("data-src")
            if image_url and image_url.startswith("//"):
                image_url = "https:" + image_url

        offers.append(Offer(
            store=slug,
            name=name,
            old_price=old_price,
            new_price=new_price,
            discount_pct=discount_pct,
            image_url=image_url,
            source_url=url,
        ))

    return offers


def main():
    all_offers: dict[str, list[dict]] = {}
    errors: list[str] = []

    for slug in STORES:
        try:
            print(f"→ scraping {slug} …", file=sys.stderr)
            offers = scrape_store(slug)
            all_offers[slug] = [asdict(o) for o in offers]
            print(f"  {len(offers)} offres trouvées", file=sys.stderr)
        except Exception as exc:
            print(f"  ⚠ échec pour {slug} : {exc}", file=sys.stderr)
            errors.append(f"{slug}: {exc}")
            all_offers[slug] = []
        time.sleep(2)

    output = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "stores_meta": STORES,
        "offers": all_offers,
        "errors": errors,
    }

    out_path = Path(__file__).parent / "data" / "promos.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ écrit {out_path} ({sum(len(v) for v in all_offers.values())} offres au total)", file=sys.stderr)


if __name__ == "__main__":
    main()
