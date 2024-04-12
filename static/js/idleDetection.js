if ("IdleDetector" in window) {
    async function runIdleDetection() {
        const state = await IdleDetector.requestPermission();
        console.log(state);
        const idleDetector = new IdleDetector();

        idleDetector.addEventListener("change", () => {
            const { userState, screenState } = idleDetector;
            if (userState == "idle") {
                // Update db to away
            }
        });

        await idleDetector.start({
            threshold: 120000,
        });
    }
}
