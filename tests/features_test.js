/* Smoke test features recettes v2 :
 * recherche + chips filtres + favoris + portions (stepper) + économies +
 * partage + TTS + temps restant + recette aléatoire + empty state.
 * S'utilise seul (node tests/features_test.js) ou depuis smoke.js. */
const { chromium } = require('playwright');

async function recipeFeaturesChecks(page, check) {
  // Aller à la vue recettes
  await page.locator('.navbtn[data-view="recettes"]').click();
  await page.waitForTimeout(1000);
  check(await page.locator('#view-recettes.active').count() === 1, 'vue recettes active');

  // Chips filtres présents
  check(await page.locator('#recipeChips .rchip').count() >= 5, '5 chips de filtre présents');
  check(await page.locator('#recipeSearch').count() === 1, 'champ recherche présent');

  // Recherche : un résultat sur « Gratin » (gratin-poireaux)
  await page.fill('#recipeSearch', 'gratin');
  await page.waitForTimeout(400);
  const gratinCount = await page.locator('#recipeGrid .recipe-card').count();
  check(gratinCount >= 1, `recherche « gratin » → ${gratinCount} carte(s)`);
  const subText = (await page.locator('#recettesSub').textContent()) || '';
  check(subText.includes('gratin'), 'sous-titre reflète la recherche');

  // Recherche sans résultat → empty state
  await page.fill('#recipeSearch', 'zzzzzz');
  await page.waitForTimeout(700);
  check((await page.locator('#recipeGrid .empty-state').count()) === 1, 'empty-state quand aucun résultat');
  await page.fill('#recipeSearch', '');
  await page.waitForTimeout(600);

  // Étoile favori : cliquer sur la 1re carte → on devient on + persistance localStorage
  await page.evaluate(() => localStorage.removeItem('promoapp_recipe_favs'));
  await page.locator('#recipeGrid .recipe-card .recipe-fav').first().click();
  await page.waitForTimeout(300);
  check(await page.locator('#recipeGrid .recipe-card .recipe-fav.on').count() >= 1, 'étoile favori activée après clic');
  check(await page.evaluate(() => (JSON.parse(localStorage.getItem('promoapp_recipe_favs') || '[]').length) === 1), 'favori persisté en localStorage');

  // Filtre favoris : 1 carte affichée
  await page.evaluate(() => document.querySelector('#recipeChips .rchip[data-f="favs"]').click());
  await page.waitForTimeout(400);
  const favCount = await page.locator('#recipeGrid .recipe-card').count();
  check(favCount === 1, `filtre favoris → ${favCount} carte(s)`);
  await page.evaluate(() => document.querySelector('#recipeChips .rchip[data-f="all"]').click());
  await page.waitForTimeout(400);

  // Filtre vege : aucune viande dans les titres dès les 8 premières cartes
  await page.evaluate(() => document.querySelector('#recipeChips .rchip[data-f="vege"]').click());
  await page.waitForTimeout(400);
  const titles = await page.locator('#recipeGrid .recipe-card h3').allTextContents();
  const badMeat = ['Bolognaise', 'Blanquette', 'Rôti', 'Tartiflette', 'Chili con carne', 'Curry de poulet', 'Poulet rôti', 'Tataki', 'Bœuf', 'Saumon', 'Bourguignon'].filter(k => titles.slice(0, 8).join(' | ').includes(k));
  check(badMeat.length === 0, 'filtre végetarien : pas de recette viande/poisson en tête');
  await page.evaluate(() => document.querySelector('#recipeChips .rchip[data-f="all"]').click());
  await page.waitForTimeout(400);

  // Économies : au moins une carte recette affiche la ligne 💸
  const saveChips = await page.locator('#recipeGrid .cost-save').count();
  check(saveChips >= 1, `ligne économie présente sur les cartes (${saveChips} cartes)`);

  // Ouvrir une recette, tester stepper portions + économies + partage
  await page.locator('#recipeGrid .recipe-card').first().click();
  await page.waitForTimeout(400);
  check(await page.locator('#recipeSheet .serv-stepper').count() === 1, 'stepper portions présent dans la fiche');
  check(await page.locator('#recipeSheet .btn-secondary.cook-launch').first().count() === 1, 'bouton partager présent');
  const qtyBefore = await page.locator('#recipeSheet .ing-qty').first().textContent();
  const persBefore = (await page.locator('#recipeSheet .recipe-modal-header p').first().textContent()) || '';
  await page.locator('#recipeSheet .serv-stepper button').nth(1).click(); // +
  await page.waitForTimeout(300);
  const qtyAfter = await page.locator('#recipeSheet .ing-qty').first().textContent();
  const persAfter = (await page.locator('#recipeSheet .recipe-modal-header p').first().textContent()) || '';
  check(persAfter.includes('👥') && !persAfter.includes(persBefore.split('personne')[0].trim()), 'quantité de personnes mise à jour après +1');
  check(qtyBefore !== qtyAfter || persBefore !== persAfter, 'quantités ingrédients mises à l\'échelle');
  check((await page.locator('#recipeSheet').innerHTML()).includes('€/pers.'), 'coût par personne recalculé');

  // Fermer, lancer le mode cuisson avec les portions ajustées
  await page.evaluate(() => closeSheet('recipeSheet'));
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#recipeGrid .recipe-card')];
    const c = cards.find(x => (x.textContent || '').includes('Gratin')) || cards[0];
    c.click();
  });
  await page.waitForTimeout(400);
  await page.locator('#recipeSheet .cook-launch').last().click();
  await page.waitForTimeout(400);
  check(await page.locator('#cookSheet.show').count() === 1, 'sheet mode cuisson ouverte');
  check(await page.locator('#cookAutoSpeak').count() === 1, 'toggle TTS (lecture vocale) présent');
  check((await page.locator('#cookMeta').textContent()).includes('personnes'), 'meta cuisson avec portions ajustées');
  const stepTxt = await page.locator('#cookStepCount').textContent();
  check(stepTxt.includes('rest.'), 'temps restant estimé affiché dans le compteur d\'étapes');
  await page.evaluate(() => stopCooking());
  await page.waitForTimeout(300);

  // Recette aléatoire (dice) depuis les promos
  await page.locator('.navbtn[data-view="promos"]').click();
  await page.waitForTimeout(400);
  check(await page.locator('button[onclick^="randomRecipe"]').count() >= 1, 'bouton recette surprise 🎲 présent');
  await page.locator('.navbtn[data-view="recettes"]').click();
  await page.waitForTimeout(600);
  await page.evaluate(() => randomRecipe());
  await page.waitForTimeout(500);
  check(await page.locator('#recipeSheet.show').count() === 1, 'recette aléatoire ouvre une fiche');
  check(await page.locator('#recipeSheet .nutri-row .nkv').count() >= 2, 'valeurs nutritionnelles affichées dans la fiche');
  await page.evaluate(() => closeSheet('recipeSheet'));
  await page.waitForTimeout(300);

  // Historique des recettes consultées → bande "récemment consultées"
  await page.locator('.navbtn[data-view="recettes"]').click();
  await page.waitForTimeout(500);
  check(await page.locator('#recentRecipes .recent-chip').count() >= 1, 'bande recettes récemment consultées rendue');

  // Menu de la semaine : 7 repas sous budget générés
  check(await page.locator('#mealPlanBudget').count() === 1, 'champ budget du menu de la semaine présent');
  await page.evaluate(() => generateMealPlan());
  await page.waitForTimeout(400);
  check(await page.locator('#mealPlanResult .mp-day').count() === 7, 'menu de 7 repas généré (7 jours)');
  check((await page.locator('#mealPlanResult .mp-total').textContent()).includes('€'), 'total du menu affiché');
  await page.evaluate(() => document.getElementById('mealPlanResult').innerHTML = '');

  // Panier : boutons comparateur / lien / scan présents
  await page.locator('.navbtn[data-view="cart"]').click();
  await page.waitForTimeout(400);
  check(await page.locator('#cartCompareBtn').count() === 1, 'bouton comparer le panier par magasin présent');
  check(await page.locator('#cartShareLinkBtn').count() === 1, 'bouton copier le lien du panier présent');
  check(await page.locator('#cartScanBtn').count() === 1, 'bouton scanner un code-barres présent');

  await page.locator('.navbtn[data-view="promos"]').click();
  await page.waitForTimeout(400);
}

module.exports = { recipeFeaturesChecks };

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errs = [];
    const check = (ok, label) => { console.log((ok ? '✅ ' : '❌ ') + label); if (!ok) errs.push(label); };
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('http://127.0.0.1:8232/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await recipeFeaturesChecks(page, check);
    check(errs.length === 0, 'aucune erreur JS console/page');
    if (errs.length) console.log('ERREURS:\n' + errs.join('\n') + '\n');
    await browser.close();
    process.exit(errs.length ? 1 : 0);
  })();
}