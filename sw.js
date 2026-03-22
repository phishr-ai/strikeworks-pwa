var CACHE_NAME = 'sw-commissions-v13';
var APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.ico', '/icons/logo.png', '/icons/icon-192x192.png', '/icons/icon-512x512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Allow the page to trigger skipWaiting when user clicks "Restart"
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  // Network-first for API calls
  if (url.hostname === 'api.triggr-app.com') {
    e.respondWith(
      fetch(e.request).catch(function () {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first for HTML (ensures updates are picked up)
  if (e.request.mode === 'navigate' || e.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone); });
        return resp;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Cache-first for static assets (icons, fonts, manifest)
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fetchPromise = fetch(e.request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone); });
        return resp;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
