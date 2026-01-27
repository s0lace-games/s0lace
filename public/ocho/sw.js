self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the request is for our own server files, let it go
  if (url.pathname === '/' || url.pathname === '/sw.js' || url.pathname.startsWith('/api/')) return;
  
  // If it's already proxied, let it go
  if (url.pathname.startsWith('/ocho/')) return;

  // LEAK DETECTOR: If a site tries to fetch a relative path (e.g. /config.json)
  // we find the original target URL from the current page address
  event.respondWith(
    clients.get(event.clientId).then(client => {
      if (!client) return fetch(event.request);
      
      const clientUrl = new URL(client.url);
      if (clientUrl.pathname.startsWith('/ocho/')) {
        const encodedPart = clientUrl.pathname.split('/ocho/')[1];
        // This is a bit complex, but essentially we reconstruct the leaked URL
        // and wrap it back into our Base64 proxy
        // To keep it simple for now, we'll just let the server catch-all handle it
        return fetch(event.request);
      }
      return fetch(event.request);
    })
  );
});
