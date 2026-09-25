/**
 * MIGATO - Service Worker Destructor de Caché y Purga de Seguridad
 * Invalida cualquier versión anterior en el navegador de los usuarios y destruye caché offline.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[MIGATO Security] Purgando caché obsoleta:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // Desregistrar este service worker para que no intercepte navegación
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && !client.url.includes('login.html')) {
          client.navigate('./login.html');
        }
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Forzar siempre a la red sin usar caché
  event.respondWith(fetch(event.request));
});
