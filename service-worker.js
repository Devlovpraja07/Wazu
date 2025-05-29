const CACHE_NAME = 'news-app-cache-v1'; // Cache version - change this when you update app files
const urlsToCache = [
  '/', // Cache the root (index.html)
  '/index.html',
  '/manifest.json',
  // Add paths to your icons here
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  // Cache Firebase SDKs (ensure these URLs are correct)
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js',
  // Add any other critical static assets for your user app
  // '/css/app-style.css', // If you use external CSS
  // '/js/app-script.js', // If you use external JS
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing News App Service Worker v1...');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('[Service Worker] Caching essential News App assets');
      // Use .addAll for critical assets, if any fail, the install fails
      return cache.addAll(urlsToCache);
    })
    .catch((error) => {
      console.error('[Service Worker] News App Cache addAll failed:', error);
      // If addAll fails, the service worker will not install
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating News App Service Worker v1...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old News App cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve(); // Keep the current cache
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming News App clients');
      // Make the current service worker control all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event: Serve from cache first, then network for certain requests
self.addEventListener('fetch', (event) => {
  // Don't intercept POST or other non-GET requests (important for Firebase writes if any)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignore range requests
  if (event.request.headers.has('range')) {
    return;
  }
  
  // Cache-first strategy for URLs that are in urlsToCache OR if you want general caching
  event.respondWith(
    caches.match(event.request)
    .then((response) => {
      // Cache hit - return response
      if (response) {
        // console.log('[Service Worker] Serving from cache:', event.request.url);
        return response;
      }
      
      // No cache hit - fetch from network
      // console.log('[Service Worker] Fetching from network:', event.request.url);
      
      // Use fetch to get the resource from the network
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            // Don't cache error responses, opaque responses (e.g., CORS without headers), etc.
            return response;
          }
          
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          
          // Cache the new response dynamically (optional, depending on what you want to cache)
          // You might want to cache images, external API responses, etc.
          // Be careful caching dynamic data like Firebase responses unless needed for offline
          // Example: Cache images
          if (event.request.url.match(/\.(png|jpg|jpeg|svg|gif)$/i)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              // console.log('[Service Worker] Dynamically cached:', event.request.url);
            });
          }
          // You could add logic here to cache Firebase data responses if needed for offline news viewing
          // This is more complex as you need to handle updates/deletions
          
          return response; // Return the original response to the client
        })
        .catch((error) => {
          // Network request failed (e.g., offline).
          console.error('[Service Worker] Fetch failed:', event.request.url, error);
          
          // For navigations (HTML pages), you could return a dedicated offline page
          if (event.request.mode === 'navigate') {
            console.log('[Service Worker] Fetch failed for navigation, attempting offline page.');
            return caches.match('/offline.html'); // You would need to create an offline.html page
          }
          
          // For other failed requests (APIs, images, etc.), just let it fail or return a placeholder
          // Returning null or an error response will cause the fetch promise to reject
          throw error; // Let the application handle the network error
        });
    })
  );
});


// Listen for messages from the page (e.g., to tell the service worker to skip waiting)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message from page:', event.data);
  // Example: Handle 'SKIP_WAITING' message to activate immediately
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skipping waiting...');
    self.skipWaiting();
  }
});