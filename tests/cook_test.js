/* Smoke test mode cuisson : vérifie le parcours complet
 * Recettes -> fiche -> bouton Mode cuisson -> sheet cuisson ->
 * étapes + minuteur + navigation + terminer.
 * S'utilise seul (node tests/cook_test.js) ou depuis smoke.js. */
const { chromium } = require('playwright');

async function cookSheetChecks(page, check) {
  // Naviguer vers la vue recettes
  check(await page.locator('.navbtn[data-view="recettes"]').count() > 0, 'onglet recettes présent');
  await page.locator('.navbtn[data-view="recettes"]').click();
  await page.waitForTimeout(1200);
  check(await page.locator('#view-recettes.active').count() === 1, 'vue recettes active');
  const rc = await page.locator('#recipeGrid .recipe-card').count();
  check(rc > 1, `grille recettes affichée (${rc} cartes)`);

  // Ouvrir une recette
  await page.locator('#recipeGrid .recipe-card').first().click();
  await page.waitForTimeout(500);
  check(await page.locator('#recipeSheet.show').count() === 1, 'fiche recette ouverte');
  check(await page.locator('.cook-launch').count() >= 1, 'bouton Mode cuisson présent');

  // Détails enrichis : quantités + ustensiles + temps prép/cuisson
  check(await page.evaluate(() => document.querySelectorAll('#recipeSheet .ing-qty').length > 0), 'quantités par ingrédient affichées');
  check(await page.evaluate(() => (document.getElementById('recipeSheet').innerHTML || '').includes('Ustensiles')), 'ustensiles affichés dans la fiche recette');
  check(await page.evaluate(() => (document.getElementById('recipeSheet').innerHTML || '').includes('Prép.')), 'temps prép/cuisson affichés dans la fiche recette');
  await page.evaluate(() => closeSheet('recipeSheet'));

  // Lancer le mode cuisson sur une recette avec consignes de chaleur (pâtes-bolognaise)
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#recipeGrid .recipe-card')];
    const c = cards.find(x => (x.textContent || '').includes('Bolognaise'));
    if (c) c.click(); else cards[0].click();
  });
  await page.waitForTimeout(500);
  await page.locator('#recipeSheet .cook-launch').last().click();
  await page.waitForTimeout(500);
  check(await page.locator('#cookSheet.show').count() === 1, 'sheet mode cuisson ouverte');
  check((await page.locator('#cookTitle').textContent()).length > 0, 'titre recette affiché');
  check(/tape \d+ \/ \d+/.test(await page.locator('#cookStepCount').textContent()), 'compteur d\'étapes affiché');
  const totalSteps = await page.locator('#cookStepsList li').count();
  check(totalSteps >= 2, `liste des ${totalSteps} étapes visibles`);
  check((await page.locator('#cookMeta').textContent()).includes('personnes'), 'meta recette (quantités/personnes) affichée');
  const cookMetaTxt = await page.locator('#cookMeta').textContent();
  check(cookMetaTxt.includes('Prép.') && cookMetaTxt.includes('Cuisson'), 'temps prép/cuisson dans le mode cuisson');
  check(await page.evaluate(() => (document.getElementById('cookTools').textContent || '').includes('🛠️')), 'ustensiles affichés dans le mode cuisson');
  const cookStepsWithHeat = await page.locator('#cookStepsList li small.heat').count();
  check(cookStepsWithHeat > 0, `${cookStepsWithHeat} étapes avec consigne feu/température (liste)`);
  // Le badge chaleur en tête d'étape doit être visible sur une étape chaude (allons à l'étape 4)
  for (let i = 1; i < 4; i++) { await page.evaluate(() => document.getElementById('cookNextBtn').click()); await page.waitForTimeout(120); }
  check(await page.locator('#cookStage .cook-heat').count() === 1, 'badge feu/température sur l\'étape courante');

  // Minuteur de la 1ère étape
  if (await page.locator('#cookTimer').isVisible()) {
    await page.locator('#cookPlayBtn').click();
    await page.waitForTimeout(1200);
    const t1 = await page.locator('#cookTimerTime').textContent();
    check(/^\d{2}:\d{2}$/.test(t1), `minuteur décompte (${t1})`);
    await page.locator('#cookPlayBtn').click(); // pause
    await page.waitForTimeout(200);
    await page.locator('#cookPlayBtn').click(); // reprendre
    await page.waitForTimeout(600);
  } else {
    check(true, 'première étape sans minuteur, test non bloquant');
  }

  // Aller à la dernière étape
  for (let i = 0; i < totalSteps; i++) {
    const cur = await page.locator('#cookStepCount').textContent();
    if (new RegExp('tape ' + totalSteps + ' /').test(cur)) break;
    await page.evaluate(() => document.getElementById('cookNextBtn').click());
    await page.waitForTimeout(150);
  }
  const lastBtn = await page.locator('#cookNextBtn').textContent();
  const lastC = await page.locator('#cookStepCount').textContent();
  check(lastBtn.includes('Terminer') && new RegExp('tape ' + totalSteps + ' /').test(lastC), `bouton « ${lastBtn.trim()} » sur la dernière étape (${lastC})`);

  // Terminer
  await page.evaluate(() => document.getElementById('cookNextBtn').click());
  await page.waitForTimeout(400);
  check(await page.locator('#cookSheet.show').count() === 0, 'sheet fermée après terminer');

  // Retour à la vue promos
  await page.locator('.navbtn[data-view="promos"]').click();
  await page.waitForTimeout(400);
}

module.exports = { cookSheetChecks };