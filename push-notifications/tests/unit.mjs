import { normalize, effectiveDiscount, bestOfferFor, weekOfOffers } from '../src/matching.mjs';

let ok = 0;
let bad = 0;
function t(cond, label) {
  if (cond) { ok++; console.log('  ✓ ' + label); }
  else { bad++; console.log('  ✗ ' + label); }
}

console.log('normalize');
t(normalize('Sauce tomate') === 'sauce tomate', 'minuscules');
t(normalize('25% de remise Sauce tomate €4,58') !== '25 remise sauce tomate €4,58', 'garde le nom');
t(normalize('Pâtes 500 g') === 'pates', 'retire les quantités (et les accents)');
t(normalize('Coca-Cola') === 'coca cola', 'retire la ponctuation');

console.log('effectiveDiscount');
t(effectiveDiscount({ discount_pct: 30 }) === 30, 'pct déclaré');
t(effectiveDiscount({ old_price: 10, new_price: 7 }) === 30, 'déduit des prix (30%)');
t(effectiveDiscount({ old_price: 0, new_price: 7 }) === 0, 'pas de remise');

console.log('bestOfferFor');
const offers = [
  { name: 'Coca-Cola', store: 'delhaize', new_price: 2.5, old_price: 3.2 },
  { name: 'Coca cola', store: 'carrefour', new_price: 2.2, old_price: 2.75, discount_pct: 20 },
];
let hit = bestOfferFor('Coca-Cola', offers);
t(hit !== null && hit.discount === 22 && hit.store === 'delhaize', 'meilleure remise retenue (22% delhaize > 20% carrefour)');
t(hit.offer.new_price === 2.5, 'prix de la bonne offre');
t(bestOfferFor('Bananes', offers) === null, 'pas de correspondance');

console.log('weekOfOffers');
t(weekOfOffers(null) === null, 'null -> null');
t(weekOfOffers({}) === null, 'sans offres -> null');
const weeks = {
  colruyt: [
    { name: 'Poulet', source_url: 'https://www.colruyt.be/folders/du-15-09-26-une-semaine-de-bonnes-affaires/' },
    { name: 'Lait', source_url: 'https://www.colruyt.be/folders/du-15-09-26-un-autre-folder/' },
  ],
  lidl: [{ name: 'Fromage', source_url: 'https://www.lidl.be/fr/folder-du-22-09-26-contenu/' }],
};
const wk = weekOfOffers(weeks);
t(wk !== null && wk.key === '2026-W38', 'premiere date du folder (15-09-2026) -> 2026-W38, got ' + (wk && wk.key));
t(wk && wk.label === 'semaine 38', 'label "semaine 38"');
t(weekOfOffers({ colruyt: [{ name: 'X', source_url: 'https://example.com/sans-date/' }] }) === null, 'aucune date -> null');

function summary() {
  console.log(`\n${ok} ok, ${bad} échec${bad ? ' — IMPACT' : ''}`);
  process.exit(bad ? 1 : 0);
}
summary();