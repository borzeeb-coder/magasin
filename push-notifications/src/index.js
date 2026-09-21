/* Cloudflare Worker — Notifications push pour PromoApp.
 *
 * 1. Déploiement (une fois) :
 *      cd push-notifications
 *      npm install
 *      npx wrangler kv namespace create PUSH_KV     # copier l'id dans wrangler.toml
 *      npx wrangler login
 *      npx wrangler secret put VAPID_PRIVATE_KEY    # coller la clé privée (.vapid-private.key)
 *      npx wrangler deploy
 *
 * 2. Brancher le site : mettre PUSH_SERVER (URL du worker) dans index.html,
 *    et la Variable GitHub "WORKER_URL" (déclenchage nocturne /check).
 *
 * Endpoints :
 *   POST /subscribe    {subscription, favs:[{name, threshold}]}
 *   POST /unsubscribe  {endpoint}
 *   POST /sync         {endpoint, favs}
 *   POST /check        corps = data/promos.json → envoie les push quand un
 *                      favori atteint son seuil de remise (appelé chaque nuit).
 */
import { setVapidDetails, sendNotification } from 'web-push';
import { bestOfferFor, weekOfOffers } from './matching.mjs';

const APP_URL = 'https://borzeeb-coder.github.io/magasin/';
const REFRESH_MIN = 24 * 60; // en minutes : on ne renvoie pas pour un même favori avant ce délai

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });
}

function subKey(endpoint) {
  return 'sub:' + (endpoint || '');
}

function favsFromBody(body) {
  const favs = (body.favs || []).map((f) => ({
    name: String(f.name || ''),
    threshold: Math.max(0, parseInt(f.threshold, 10) || 0),
  }));
  return favs.filter((f) => f.name);
}

async function storeSubscription(env, endpoint, subscription, favs, notifyNewProspectus) {
  const existing = await env.PUSH_KV.get(subKey(endpoint), 'json');
  const record = {
    subscription,
    favs,
    notifyNewProspectus: !!notifyNewProspectus,
    notified: (existing && existing.notified) || {},
  };
  await env.PUSH_KV.put(subKey(endpoint), JSON.stringify(record));
  return record;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // En module Workers, les bindings n'existent que via `env` (pas en globals).
    setVapidDetails(
      env.PUSH_SUBJECT || 'mailto:promoapp@example.com',
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );

    try {
      if (method === 'POST' && url.pathname === '/subscribe') {
        const body = await request.json();
        const { subscription } = body;
        if (!subscription || !subscription.endpoint) {
          return json({ error: 'subscription manquante' }, 400);
        }
        const favs = favsFromBody(body);
        await storeSubscription(env, subscription.endpoint, subscription, favs, body.newProspectus);
        return json({ ok: true, favs: favs.length });
      }

      if (method === 'POST' && url.pathname === '/unsubscribe') {
        const { endpoint } = await request.json();
        if (endpoint) await env.PUSH_KV.delete(subKey(endpoint));
        return json({ ok: true });
      }

      if (method === 'POST' && url.pathname === '/sync') {
        const body = await request.json();
        const { endpoint } = body;
        if (!endpoint) return json({ error: 'endpoint manquant' }, 400);
        const existing = await env.PUSH_KV.get(subKey(endpoint), 'json');
        if (!existing) return json({ ok: false, reason: 'inconnu' }, 404);
        const favs = favsFromBody(body);
        const keepNotify = body.newProspectus !== undefined ? !!body.newProspectus : existing.notifyNewProspectus;
        await storeSubscription(env, endpoint, existing.subscription, favs, keepNotify);
        return json({ ok: true, favs: favs.length });
      }

      if (method === 'POST' && url.pathname === '/check') {
        return await runCheck(env, await request.text());
      }

      return json({ ok: false, error: 'not found' }, 404);
    } catch (err) {
      return json({ ok: false, error: String(err && err.message || err) }, 500);
    }
  },
};

/* Vérifie chaque abonnement : un favori a-t-il atteint son seuil de remise ? */
async function runCheck(env, promosText) {
  let promos;
  try {
    promos = JSON.parse(promosText);
  } catch (e) {
    return json({ ok: false, error: 'promos.json illisible' }, 400);
  }

  const all = [];
  try {
    const list = await env.PUSH_KV.list({ prefix: 'sub:' });
    for (const key of list.keys) {
      const rec = await env.PUSH_KV.get(key.name, 'json');
      if (rec && rec.subscription) all.push({ key: key.name, ...rec });
    }
  } catch (e) {
    return json({ ok: false, error: 'KV inaccessible : ' + e.message }, 500);
  }

  let sent = 0;
  let checked = 0;
  const now = Date.now();

  // Nouveau prospectus ? (semaine différente de la dernière vue) → un push
  // générique à tous les abonnés qui l'ont demandé, même sans favori déclencheur.
  let weekChanged = false;
  let weeks = null;
  try {
    weeks = weekOfOffers(promos.offers);
    if (weeks) {
      const prevWeek = await env.PUSH_KV.get('meta:week');
      if (prevWeek !== weeks.key) {
        weekChanged = true;
        await env.PUSH_KV.put('meta:week', weeks.key);
      }
    }
  } catch (e) { /* la détection de semaine ne doit jamais bloquer le /check */ }

  const prospectusPayload = weekChanged ? JSON.stringify({
    title: `📢 Nouveau prospectus PromoApp — ${weeks.label} !`,
    body: 'Les promos de la semaine ont changé. Ouvrez l\'app pour voir les nouvelles offres.',
    url: APP_URL,
  }) : null;

  for (const rec of all) {
    for (const fav of rec.favs || []) {
      if (!fav.threshold) continue;
      const hit = bestOfferFor(fav.name, promos.offers);
      if (!hit || hit.discount < fav.threshold) continue;

      // Pas de doublon trop rapproché
      const last = rec.notified[fav.name] || 0;
      if (now - last < REFRESH_MIN * 60 * 1000) continue;

      const o = hit.offer;
      const num = Number(o.new_price);
      const details = num > 0 ? num.toFixed(2).replace('.', ',') + ' €' : 'en magasin';
      const payload = JSON.stringify({
        title: `PromoApp · −${hit.discount}% sur ${fav.name.slice(0, 40)}`,
        body: `${hit.store.charAt(0).toUpperCase() + hit.store.slice(1)} : ${details}${o.old_price ? ' (au lieu de ' + o.old_price.toFixed(2).replace('.', ',') + ' €)' : ''}`,
        url: APP_URL,
      });
      try {
        await sendNotification(rec.subscription, payload, { TTL: 86400 });
        sent++;
        rec.notified[fav.name] = now;
        checked++;
      } catch (err) {
        // Abonnement mort ? On le retire pour ne pas encombrer le KV.
        if (/410|404|expire/i.test(String(err && err.message || err))) {
          await env.PUSH_KV.delete(rec.key);
        }
      }
    }

    if (prospectusPayload && rec.notifyNewProspectus) {
      try {
        await sendNotification(rec.subscription, prospectusPayload, { TTL: 86400 });
        sent++;
        checked++;
      } catch (err) {
        if (/410|404|expire/i.test(String(err && err.message || err))) {
          await env.PUSH_KV.delete(rec.key);
        }
      }
    }
    if (Object.keys(rec.notified).length) {
      await env.PUSH_KV.put(rec.key, JSON.stringify({ ...rec, notified: rec.notified }));
    }
  }

  return json({ ok: true, checked: all.length, sent, evaluated: checked });
}