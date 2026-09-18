/* Smoke test : charge l'app (http.server local), vérifie qu'elle s'affiche
 * sans erreur JS, que les cartes/donnees/images sont presentes, et que la
 * PWA (manifest, service worker) est servie correctement. */
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
    const imgs404 = [];
    for (const src of localImgs) {
      const r = await page.request.get(src);
      if (!r.ok()) imgs404.push(src);
    }
    check(imgs404.length === 0, `${localImgs.length} images de carte OK${imgs404.length ? ' (échec: ' + imgs404.join(',') + ')' : ''}`);

    check(errors.length === 0, 'aucune erreur JS console/page' + (errors.length ? ' — ' + errors.join(' | ') : ''));
  } catch (err) {
    check(false, 'erreur du test : ' + err.message);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  process.exit(failed ? 1 : 0);
}

main();