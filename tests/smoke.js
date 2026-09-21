/* Smoke test : charge l'app (http.server local), vérifie qu'elle s'affiche
 * sans erreur JS, que les cartes/donnees/images sont presentes, et que la
 * PWA (manifest, service worker) est servie correctement.
 * Extensions : comparateur, carte magasins, favoris-prix en baisse. */
const { spawn } = require('node:child_process');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const server = spawn('python', ['-m', 'http.server', '8123', '--bind', '127.0.0.1'], {
    cwd: ROOT, stdio: 'ignore',
  });
  await sleep(1200);

  let failed = false;
  const check = (ok, msg) => {
    if (!ok) { failed = true; console.log('❌ ' + msg); }
    else console.log('✅ ' + msg);
  };

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Le rendu est incrémental (64 cartes puis remplissage au scroll) :
    // on charge la grille complète avant de compter les cartes/logos/offres.
    await page.evaluate(() => { for (let i = 0; i < 64; i++) renderMore(); });
    await page.waitForTimeout(300);

    const cards = await page.locator('.pcard').count();
    const resultCount = await page.textContent('#resultCount');
    const logos = await page.$$eval('.badge-store img', els => els.map(e => e.getAttribute('src')));
    const noPrice = await page.locator('.no-price').count();

    check(cards > 20, `affiche ${cards} cartes promo (résultat : « ${resultCount} »)`);
    check(new Set(logos).size >= 7, `les ${new Set(logos).size}/7 logos d'enseigne sont rendus`);
    check(noPrice >= 5, `${noPrice} offres « Prix en magasin » affichées`);

    // Fiche produit
    await page.locator('.pcard .pcard-name').first().click();
    await page.waitForTimeout(400);
    check(await page.locator('#productSheet.show').count() === 1, 'fiche produit ouverte');
    check(await page.locator('#pdShareBtn').count() === 1, 'bouton partager présent');
    await page.locator('#productSheet .sheet-close').click();
    await page.waitForTimeout(200);

    // PWA
    for (const [u, label] of [
      ['/manifest.webmanifest', 'manifest'],
      ['/sw.js', 'service worker'],
      ['/data/promos.json', 'promos'],
    ]) {
      const r = await page.request.get('http://127.0.0.1:8123' + u);
      check(r.ok(), `${label} servi (HTTP ${r.status()})`);
    }

    // Images locales
    const localImgs = await page.$$eval('.pcard-img img', els => els.map(e => e.src));
    const imgsLocal = [];
    const imgsCdn = [];
    const imgs404 = [];
    for (const src of localImgs) {
      if (/^https?:\/\//.test(src) && !src.includes('127.0.0.1')) { imgsCdn.push(src); continue; }
      imgsLocal.push(src);
      const r = await page.request.get(src);
      if (!r.ok()) imgs404.push(src);
    }
    check(imgs404.length === 0, `${imgsLocal.length} images de carte OK (locales)${imgs404.length ? ' — échec: ' + imgs404.join(',') : ''}`);
    if (imgsCdn.length) console.log(`ℹ️ ${imgsCdn.length} images hébergées sur CDN (non testées, hors de portée du repo)`);

    check(errors.length === 0, 'aucune erreur JS console/page' + (errors.length ? ' — ' + errors.join(' | ') : ''));

    // --- NOUVELLES VALIDATIONS ---

    // 1. Comparateur : la balise "🏆 le moins cher" doit être présente
    //    après ouverture du comparateur depuis une fiche produit
    await page.locator('.pcard .pcard-name').first().click();
    await page.waitForTimeout(300);
    await page.locator('#pdCompareBtn').click();
    await page.waitForTimeout(400);
    const cmpBest = await page.locator('.cmp-best-tag').count();
    check(cmpBest > 0, 'balise "🏆 le moins cher" présente dans le comparateur');
    await page.locator('#compareSheet .sheet-close').click();
    await page.waitForTimeout(200);
    await page.locator('#productSheet .sheet-close').click();
    await page.waitForTimeout(200);

    // 2. Carte des magasins : la section #view-stores doit exister
    const mapSection = await page.locator('#view-stores').count();
    check(mapSection === 1, 'section carte des magasins #view-stores présente');

    // 3. Favoris : la barre d'alerte de seuil doit être présente après
    //    ajout d'un favori puis navigation vers la vue favoris
    await page.locator('.pcard .pcard-name').first().click();
    await page.waitForTimeout(300);
    await page.locator('#pdFavBtn').click();
    await page.waitForTimeout(200);
    await page.locator('#productSheet .sheet-close').click();
    await page.waitForTimeout(200);
    await page.locator('.navbtn[data-view="favs"]').click();
    await page.waitForTimeout(400);
    const alertBars = await page.locator('.fav-alert-bar').count();
    check(alertBars >= 1, 'barre d\'alerte favori présente (seuil configurable)');
    
    // 4. Bouton comparateur présent
    const cmpBtn = await page.locator('#pdCompareBtn').count();
    check(cmpBtn === 1, 'bouton comparateur #pdCompareBtn présent');

    // 7. Nouveautés : chip + bannière + filtre
    await page.locator('.navbtn[data-view="promos"]').click();
    await page.waitForTimeout(400);
    check(await page.locator('#newChip').count() === 1, 'chip Nouveautés présent');
    await page.evaluate(() => {
      state.newIds = new Set([PRODUCTS[0].id, PRODUCTS[1].id]);
    });
    await page.locator('.navbtn[data-view="favs"]').click();
    await page.locator('.navbtn[data-view="promos"]').click();
    await page.waitForTimeout(500);
    check(await page.locator('#newBanner').isVisible(), 'bannière nouveautés visible avec compteur');
    await page.click('#newBannerBtn');
    await page.waitForTimeout(500);
    check(await page.locator('.pcard').count() === 2, 'filtre nouveautés → uniquement les 2 nouvelles cartes');

    // 4bis. PWA "installable + rappel prospectus"
    check(await page.locator('#installBtn').count() === 1, 'bouton installer présent (masqué par défaut)');
    check(await page.evaluate(() => {
      const el = document.getElementById('installBtn');
      return el && getComputedStyle(el).display === 'none';
    }), 'installBtn masqué par défaut');
    check(await page.evaluate(() => initPWA.toString().includes('appinstalled')), 'gestion appinstalled (toast install)');
    check(await page.evaluate(() => subscribePush.toString().includes('newProspectus')), 'opt-in « rappel nouveau prospectus » dans subscribePush');
    await page.evaluate(() => localStorage.setItem('pa_week_seen', '0'));
    await page.reload();
    await page.waitForTimeout(1600);
    check(await page.locator('#prospectusBanner').isVisible(), 'bannière « nouveau prospectus » visible après changement de semaine');
    await page.evaluate(() => document.getElementById('prospectusDismiss').click());
    await page.waitForTimeout(200);
    check(await page.evaluate(() => {
      const el = document.getElementById('prospectusBanner');
      return el.style.display === 'none' && Object.keys(localStorage).some(k => k.indexOf('pa_prospectus_dismissed_') === 0 && localStorage.getItem(k) === '1');
    }), '« J\'ai vu » masque la bannière et la mémorise');

    // 5. Mode cuisson : parcours complet recette + étapes + minuteur
    const { cookSheetChecks } = require('./cook_test.js');
    await cookSheetChecks(page, check);

    // 6. Trio impact recettes v5 : 12 recettes originales + idées panier
    await page.locator('.navbtn[data-view="recettes"]').click();
    await page.waitForTimeout(600);
    check(await page.locator('#recipeGrid .recipe-card').count() === 45, 'grille recettes : 45 recettes (v5 + 12 originales)');
    check(await page.locator('#cartIdeasBtn').count() === 1, 'bouton idées recettes avec panier présent');
    await page.click('#cartIdeasBtn');
    await page.waitForTimeout(400);
    check((await page.locator('#cartIdeasResult').innerText()).includes('panier est vide'), 'message panier vide affiché');
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('pa_cart') || '{}');
      p['ing:pâtes'] = 1; localStorage.setItem('pa_cart', JSON.stringify(p));
    });
    await page.reload();
    await page.locator('.navbtn[data-view="recettes"]').click();
    await page.waitForTimeout(600);
    await page.click('#cartIdeasBtn');
    await page.waitForTimeout(400);
    check(await page.locator('#cartIdeasResult .ci-row').count() >= 1,
      'idées recettes proposées à partir du panier (pâtes)');

    // 8bis. Budget gauge + shopping list
    await page.locator('.navbtn[data-view="cart"]').click();
    await page.waitForTimeout(600);
    check(await page.locator('#budgetGauge').isVisible(), 'jauge budget visible dans le panier');
    check(await page.evaluate(() => {
      const fill = document.getElementById('budgetGaugeFill');
      return fill && getComputedStyle(fill).width !== '0px';
    }), 'barre budget remplie proportionnellement');
    await page.click('#shoppingListBtn');
    await page.waitForTimeout(400);
    check(await page.locator('#shoppingListSheet.show').count() === 1, 'sheet liste de courses s\'ouvre');
    check(await page.locator('#shoppingListContent .sl-store').count() >= 1, 'liste groupée par magasin/rayon rendue');
    await page.click('#shoppingListSheet .sheet-close');
    await page.waitForTimeout(200);

    // 7. Features recettes v2 : recherche, filtres, favoris, portions,
    //    économies, partage, TTS, temps restant, recette aléatoire
    const { recipeFeaturesChecks } = require('./features_test.js');
    await recipeFeaturesChecks(page, check);

  } catch (err) {
    check(false, 'erreur du test : ' + err.message);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  process.exit(failed ? 1 : 0);
}

main();