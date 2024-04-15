const profile = document.querySelector(".profile >  button:first-of-type");
const profileCloseButton = document.querySelector(".profileMenu >  button");
const menu = document.querySelector(".profileMenu");
menu.style.display = "none";
profile.addEventListener("click", () => {
    if (menu.style.display === "none") {
        menu.style.display = "grid";
    } else {
        menu.style.display = "none";
    }
});
profileCloseButton.addEventListener("click", () => {
    if (menu.style.display === "none") {
        menu.style.display = "grid";
    } else {
        menu.style.display = "none";
    }
});

const openSideBar = document.querySelector(".profile > button:last-of-type");
const sidebar = document.querySelector(".sidebar");
openSideBar.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});
