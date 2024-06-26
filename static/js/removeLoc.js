const id = getIdFromUrl("account");
setIdToRemember(id);

// Event listener for the logout button
const logoutButton = document.querySelector(".profile form:nth-of-type(1) button");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        removeIdToRemember(); // Remove "rememberAccount" from localStorage on logout
    });
}


const notFoundPage = document.querySelector("main > h1");
if (notFoundPage && notFoundPage.textContent === "Page not found") {
    removeIdToRemember();
}
