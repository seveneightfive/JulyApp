const CACHE_NAME = 'eventhub-v1'
const urlsToCache = [
  '/',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  // For navigation requests (like magic link redirects), always go to network first
  // to ensure URL hash fragments are properly processed
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
        })
    )
  } else {
    // For other requests (assets, etc.), use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(event.request)
        })
    )
  }
})