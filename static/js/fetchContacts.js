const chatList = document.querySelector(".chats");
const allChatsLength = chatList.querySelectorAll("li").length;

async function getContactStatus() {
    await fetch(`/getAllContacts/${userId}`).then(async (response) => {
        if (response.ok) {
            const data = await response.json();
            // console.log(data);

            // console.log(data.allContacts.length, allChatsLength);
            // if (data.allContacts.length !== allChatsLength) {
            chatList.innerHTML = "";
            data.allContacts.forEach((contact) => {
                // TODO DYNAMIC CHATID AND PIC
                const chatWitContact = `
                    <li>
                        <span class="visually-hidden">Chat with: </span>
                        <a href="/account/${userId}/chat/${contact.chatId}">
                            <img src="${contact.pfPicture}" alt="pf">
                            ${contact.contact.name}
                        </a>
                    </li>`;
                chatList.insertAdjacentHTML("beforeEnd", chatWitContact);
            });
            // }
        } else {
            console.error("Failed to get status");
        }
    });
}
getContactStatus();
setInterval(getContactStatus, 3000);
