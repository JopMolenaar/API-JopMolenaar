const profile = document.querySelector(".profile");
const menu = document.querySelector(".profileMenu");
menu.style.display = "none";
profile.addEventListener("click", () => {
    if (menu.style.display === "none") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
});
profile.addEventListener("mouseover", () => {
    menu.style.display = "block";
});
profile.addEventListener("mouseout", () => {
    menu.style.display = "none";
});
