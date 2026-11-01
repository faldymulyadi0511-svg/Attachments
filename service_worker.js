const CACHE_NAME = "taskmate-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon.svg"
];

// Memasang Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_FILES);
        })
    );

    self.skipWaiting();
});

// Mengaktifkan Service Worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// Mengambil file dari cache
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // Hanya cache file dari website sendiri
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {
                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });
                }

                return response;
            });
        })
    );
});