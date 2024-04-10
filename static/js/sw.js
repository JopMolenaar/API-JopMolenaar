if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/serviceWorker.js").then(
            function (registration) {
                console.log("ServiceWorker registration successful with scope: ", registration.scope);
            },
            function (err) {
                console.log("ServiceWorker registration failed: ", err);
            }
        );
    });
}
