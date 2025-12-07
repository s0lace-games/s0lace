importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// Only handle scramjet URLs (not images, not TMDB, not cinemaos)
function shouldProxy(url) {
  return (
    url.pathname.startsWith('/scram/') ||
    url.pathname.startsWith('/baremux/') ||
    url.pathname.startsWith('/epoxy/')
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip ALL external assets
  if (!shouldProxy(url)) {
    return event.respondWith(fetch(event.request));
  }

  // Scramjet request
  event.respondWith((async () => {
    await scramjet.loadConfig();
    if (scramjet.route(event)) {
      return scramjet.fetch(event);
    }
    return fetch(event.request);
  })());
});
