const notiYesButton = document.querySelector("#yesNoti");
const notiHeader = document.querySelector(".notificationHeader");
if (notiYesButton) {
    notiYesButton.addEventListener("click", () => {
        askPermission();
        getNotificationPermissionState();
        subscribeUserToPush();
        notiHeader.style.display = "none";
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== "granted") {
            throw new Error("We weren't granted permission.");
        } else if (permissionResult === "granted") {
            new Notification("You can now get notifications");
        }
    });
}

function getNotificationPermissionState() {
    if (navigator.permissions) {
        return navigator.permissions.query({ name: "notifications" }).then((result) => {
            return result.state;
        });
    }

    return new Promise((resolve) => {
        resolve(Notification.permission);
    });
}

function getSWRegistration() {
    if ("serviceWorker" in navigator) {
        return navigator.serviceWorker.register("/serviceWorker.js");
    } else {
        return;
    }
}

function subscribeUserToPush() {
    return getSWRegistration()
        .then(function (registration) {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array("BNvTbER8XgCTGxnGOVRLnnCfHA5WdTfe51CEHtGBAVeJuDbtsGjojizJIe-hgDbNda_zevi3cv_mf9Z642JcqP8"),
            };

            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(function (pushSubscription) {
            const subscriptionObject = JSON.stringify(pushSubscription);
            sendSubscriptionToBackEnd(subscriptionObject);
            return subscriptionObject;
        });
}

function sendSubscriptionToBackEnd(subscription) {
    const userId = getIdFromUrl("account");
    console.log("account:", userId);
    return fetch(`/save-subscription/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // body: JSON.stringify({ subscription, userId: userId }),
        // body: JSON.stringify(subscription),
        body: subscription,
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Bad status code from server.");
            }

            return response.json();
        })
        .then(function (responseData) {
            if (!(responseData.data && responseData.data.success)) {
                throw new Error("Bad response from server.");
            }
        });
}
