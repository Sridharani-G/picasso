// Service Worker for offline functionality

const CACHE_NAME = 'arthub-v1';
const urlsToCache = [
  '/',
  '/explore',
  '/artists',
  '/competitions',
  '/shop',
  '/learn',
  '/profile',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ensure the new service worker takes control immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Bypass caching for Next.js internal assets, HMR/Turbopack, websocket, and API
  const url = new URL(event.request.url);
  const decodedPath = decodeURIComponent(url.pathname || '');
  if (
    decodedPath.startsWith('/_next') ||
    decodedPath.includes('[turbopack]') ||
    decodedPath.startsWith('/sockjs-node') ||
    decodedPath.startsWith('/api') ||
    (event.request.destination === 'script' && decodedPath.includes('hmr-client'))
  ) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // If network request fails, return a fallback response
          if (event.request.destination === 'document') {
            // Return the main page if the user is navigating to any page
            return caches.match('/');
          }
          // For other assets, return a placeholder or error
          return new Response('Offline', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Claim clients so the SW controls pages immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Allow runtime clearing of caches via postMessage
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      console.log('All caches cleared via message');
    });
  }
});