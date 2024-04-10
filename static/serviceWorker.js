const CACHE_NAME = "firstCache";
const filesToCache = ["/js/extraFunctions.js"];
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(filesToCache);
        })
    );
});

// self.addEventListener("active", (event) => {
//     console.log("service worker activate event!");
// });

// self.addEventListener("push", (event) => {
//     console.log("push noti");
// });

// importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

// workbox.routing.registerRoute(({ request }) => request.destination === "image", new workbox.strategies.NetworkFirst());
