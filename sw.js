/* Lab OS PWA service worker — shell 快取 + 網路優先 */
const CACHE = "labos-shell-v1";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
/* API 請求走網路;shell 網路失敗時退回快取 (離線也開得起來) */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.includes("api.github.com")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const cp = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true})));
});
