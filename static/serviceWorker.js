const CACHE_NAME = "firstCache";
const filesToCache = ["/js/extraFunctions.js"]; // store more files so that the user can access the website offline
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // console.log("Opened cache");
            return cache.addAll(filesToCache);
        })
    );
});

function handlePushEvent(event) {
    return Promise.resolve()
        .then(() => {
            return event.data.json();
        })
        .then((data) => {
            const title = data.title;
            const options = {
                body: data.body,
                icon: data.icon,
            };
            return registration.showNotification(title, options);
        })
        .catch((err) => {
            console.error("Push event caused an error: ", err);
            // TODO don't show a message (in production)
            const title = "Message Received";
            const options = {
                body: event.data.text(),
            };
            return registration.showNotification(title, options);
        });
}

self.addEventListener("push", function (event) {
    event.waitUntil(handlePushEvent(event));
});



// importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

// workbox.routing.registerRoute(({ request }) => request.destination === "image", new workbox.strategies.NetworkFirst());
