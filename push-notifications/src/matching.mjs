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

/* Semaine du prospectus déduite des URLs de folder (ex. ".../folder-du-15-09-26/"),
 * même règle que l'app. Retourne { key: "2026-W38", label: "semaine 38" } ou null. */
export function weekOfOffers(offers) {
  const src = (offers && typeof offers === 'object') ? Object.values(offers).flat() : [];
  let d = null;
  for (const o of src) {
    const m = String(o && o.source_url || '').match(/du-(\d{2})-(\d{2})-(\d{2})/);
    if (m) {
      // format folder : du-DD-MM-YY
      const dt = new Date(2000 + Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      if (!Number.isNaN(dt.getTime())) { d = dt; break; }
    }
  }
  if (!d) return null;
  const y = d.getFullYear();
  const startJan = new Date(y, 0, 1);
  const week = Math.ceil((((d - startJan) / 86400000) + d.getDay() + 1) / 7);
  return { key: `${y}-W${String(week).padStart(2, '0')}`, label: `semaine ${week}` };
}