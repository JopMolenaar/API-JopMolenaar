const profileMenu = document.querySelector(".profileMenu");
const contactForm = document.querySelector("#addContact");
contactForm.removeAttribute("action", "");
contactForm.removeAttribute("method", "");
const contactList = document.querySelector(".chats");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const contactName = document.querySelector("input[name=name]").value;
    const response = await fetch("/addContactJs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // get the user from the url and send user id to the backend
        body: JSON.stringify({ name: contactName, userId: userId }),
    });
    const data = await response.json();
    if (!data.error) {
        profileMenu.style.display = "none";
        const chat = ` <li>
                            <span class="visually-hidden">Chat with: </span>
                            <a href="/account/${userId}/chat/${data.chatId}">
                                <img src="/images/profileDefault.png" alt="pf">
                                ${data.contactName}
                            </a>
                        </li>`;
        contactList.insertAdjacentHTML("beforeend", chat);
    } else {
        const errorSection = `  <section class="errorSection">
                                    <h2>An error occurred</h2>
                                    <p>Error: ${data.message}</p>
                                </section>`;
        document.querySelector("body main").insertAdjacentHTML("beforeend", errorSection);
    }
});
