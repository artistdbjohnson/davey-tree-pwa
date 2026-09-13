const CACHE = "davey-study-v1";
const ASSETS = ["/", "/styles.css", "/app.js", "/manifest.json", "/icon.svg", "/residential/", "/commercial/", "/utility/", "/environmental/", "/about/", "/contact/"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
