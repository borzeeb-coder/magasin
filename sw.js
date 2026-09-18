/* PromoApp - Service Worker : mise en cache des fichiers pour usage hors-ligne */
const VERSION = 'promoapp-v2';
const CORE_ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './data/promos.json',
  './logos/colruyt.logo.svg',
  './logos/delhaize.logo.svg',
  './logos/carrefour.logo.svg',
  './logos/lidl.logo.svg',
  './logos/aldi.logo.svg',
  './logos/spar.logo.svg',
  './logos/intermarche.logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      // On précache aussi les images locales référencées par les promos
      // pour un fonctionnement 100% hors-ligne dès la première installation.
      try {
        const data = await (await fetch('./data/promos.json')).json();
        const images = [];
        Object.values(data.offers || {}).forEach((list) => {
          (list || []).forEach((o) => {
            if (o.image_url && o.image_url.startsWith('data/images/')) images.push('./' + o.image_url);
          });
        });
        await cache.addAll(images);
      } catch (e) { /* les images seront mises en cache à la volée sinon */ }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
  // Notify all open windows that a new SW is active
  self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clients) => {
    clients.forEach((client) => {
      if (client.ready) client.postMessage({type: 'PWA_UPDATE'});
    });
  });
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'PromoApp — Promo en cours';
  const options = {
    body: data.body || '',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    data: { url: data.url || './index.html' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || './index.html', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length) {
        const target = list[0];
        if ('navigate' in target) {
          return target.navigate(url).catch(() => target.focus());
        }
        return target.focus();
      }
      return clients.openWindow(url);
    })
  );
});

/* Stratégie réseau d'abord, cache en secours (hors-ligne) */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('./index.html'))
      )
  );
});