/* Logique de correspondance favori <-> offre, pur et testable.
 * Exporté en module ESM pour les tests unitaires (tests/unit.mjs). */

export function normalize(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b\d+[.,]?\d*\s*(kg|g|l|cl|ml|dl|pack|paquet|x)\b/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(le|la|les|de|des|du|au|aux|et|a|avec|sans|bio|pack|doré)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Remise effective d'une offre : pourcentage déclaré, sinon déduit des prix. */
export function effectiveDiscount(offer) {
  const pct = Number(offer.discount_pct);
  if (pct > 0) return pct;
  const old = Number(offer.old_price);
  const neu = Number(offer.new_price);
  if (old > 0 && neu > 0 && old > neu) {
    return Math.round((1 - neu / old) * 100);
  }
  return 0;
}

/* Retrouve l'offre correspondant au favori dans promos.json (tableau plat).
 * Retourne la meilleure correspondance {offer, store, discount} ou null. */
export function bestOfferFor(favName, offers) {
  const want = normalize(favName);
  if (!want) return null;
  let best = null;
  for (const offer of offers || []) {
    const got = normalize(offer.name);
    if (!got || got !== want) continue;
    const discount = effectiveDiscount(offer);
    if (!best || discount > best.discount) {
      best = { store: offer.store || '', offer, discount };
    }
  }
  return best;
}