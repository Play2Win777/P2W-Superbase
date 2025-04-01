const CACHE_NAME = 'p2w-v2';
const PRECACHE_URLS = [
  '/',
  '/assets/icons/placeholderlogo_small.webp',
  '/assets/css/index-*.css',
  '/assets/js/index-*.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('fetch', event => {
  // Cache-first strategy for static assets
  if (event.request.url.includes('/covers/') || 
      event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) return response;
          
          // Otherwise fetch and cache
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
              
              return response;
            });
        })
    );
  }
});