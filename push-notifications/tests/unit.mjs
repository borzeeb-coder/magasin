import { normalize, effectiveDiscount, bestOfferFor } from '../src/matching.mjs';

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
const offers = {
  delhaize: [{ name: 'Coca-Cola', new_price: 2.5, old_price: 3.2 }],
  carrefour: [{ name: 'Coca cola', new_price: 2.2, old_price: 2.75, discount_pct: 20 }],
};
let hit = bestOfferFor('Coca-Cola', offers);
t(hit !== null && hit.discount === 22 && hit.store === 'delhaize', 'meilleure remise retenue (22% delhaize > 20% carrefour)');
t(hit.offer.new_price === 2.5, 'prix de la bonne offre');
t(bestOfferFor('Bananes', offers) === null, 'pas de correspondance');

function summary() {
  console.log(`\n${ok} ok, ${bad} échec${bad ? ' — IMPACT' : ''}`);
  process.exit(bad ? 1 : 0);
}
summary();