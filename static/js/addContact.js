const userId = getIdFromUrl("account");
const contactForm = document.querySelector("#addContact");
contactForm.removeAttribute("action", "");
contactForm.removeAttribute("method", "");
const contactList = document.querySelector(".contacts");

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

// Fetch the data and look if there is made a chat

async function checkForChat() {
    // console.log("checkForChat");
    let allLiData = [];
    const allIds = contactList.querySelectorAll("li");
    allIds.forEach((li) => {
        const user = li.querySelector("input[name=user]");
        const contact = li.querySelector("input[name=contact]");
        if (user && contact) {
            const data = { user: user.value, contact: contact.value };
            allLiData.push(data);
        }
    });
    if (allLiData[0]) {
        const response = await fetch("/checkForChat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // get the user from the url and send user id to the backend
            body: JSON.stringify(allLiData),
        });
        const data = await response.json();
        if (!data.error) {
            if (data.data[0].chat) {
                const input = document.querySelector(`input[value='${data.data[0].contact}']`);
                const form = input.parentElement;
                form.remove();
            }
        } else {
            console.error(`There is an error: ${data.message}`);
            // TODO show error message
        }
    }
}
checkForChat();
setInterval(checkForChat, 1000);