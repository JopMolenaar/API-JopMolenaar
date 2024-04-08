const userId = getIdFromUrl("account");
const contactForm = document.querySelector("#addContact");
contactForm.removeAttribute("action", "");
contactForm.removeAttribute("method", "");

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
        const contactList = document.querySelector(".contacts");
        const html = `<li> ${data.contactName}
                        <form action="/addChat" method="post">
                        <input type="hidden" name="user" value="${data.userId}">
                        <input type="hidden" name="contact" value="${data.contactId}">
                        <button type="submit">New chat</button>
                        </form>
                    </li>`;
        contactList.insertAdjacentHTML("beforeend", html);
    } else {
        console.error(`There is an error: ${data.message}`);
        // TODO show error message
    }
});
