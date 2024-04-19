const threshold = 60000; // 1 minute
const accountId = getIdFromUrl("account"); // id of account
async function askIdleDetection() {
    if ("IdleDetector" in window) {
        const state = await IdleDetector.requestPermission();
        if (state === "granted") {
            localStorage.setItem("idlePermissionGranted", "true");
            permissionGranted = true;
        } else {
            localStorage.setItem("idlePermissionGranted", "false");
            // console.log("Idle detection permission denied.");
            return; // Exit function if permission is denied
        }
        // console.log(state);
        const idleDetector = new IdleDetector();

        idleDetector.addEventListener("change", async () => {
            const { userState, screenState } = idleDetector;
            if (userState == "idle") {
                // console.log("userState is idle");
                // console.log("screen:", screenState);
                // update the db to offline
                // Update db to away
                updateDb("Offline", accountId);
            } else {
                // console.log("user state is not idle");
                // console.log("screen:", screenState);
                // update the db to online
                updateDb("Online", accountId);
            }
            if (screenState === "locked") {
                // update to offline
                updateDb("Offline", accountId);
                // console.log("screen state locked");
            }
        });

        await idleDetector.start({
            threshold: threshold,
        });
    }
}

async function runIdleDetection() {
    if ("IdleDetector" in window) {
        let permissionGranted = localStorage.getItem("idlePermissionGranted");

        if (permissionGranted === "true") {
            const idleDetector = new IdleDetector();

            idleDetector.addEventListener("change", async () => {
                const { userState, screenState } = idleDetector;
                if (userState === "idle") {
                    // console.log("User state is idle");
                    // console.log("Screen state:", screenState);
                    updateDb("Offline", accountId);
                } else {
                    // console.log("User state is not idle");
                    // console.log("Screen state:", screenState);
                    updateDb("Online", accountId);
                }
                if (screenState === "locked") {
                    // console.log("Screen state is locked");
                    updateDb("Offline", accountId);
                }
            });

            await idleDetector.start({
                threshold: threshold, // Time threshold in milliseconds for idle detection
            });
        }
    } else {
        // console.log("Idle Detection API is not supported in this browser.");
    }
}
runIdleDetection();

async function updateDb(status, user) {
    console.log(status, user);
    const response = await fetch("/updateStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // get the user from the url and send user id to the backend
        body: JSON.stringify({ status, userId: user }),
    });
    if (response.ok) {
        // console.log("Text sent successfully");
    } else {
        console.error("Failed to update your status");
        // const errorSection = `  <section class="errorSection">
        //                             <h2>An error occurred</h2>
        //                             <p>Error: Failed to update your status</p>
        //                         </section>`;
        // document.querySelector("body main").insertAdjacentHTML("beforeend", errorSection);
    }
}
