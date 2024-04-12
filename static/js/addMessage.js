const userId = getIdFromUrl("account");
const chatId = getIdFromUrl("chat");
const eventList = document.querySelector(".message-box");
const textForm = document.querySelector(".textForm");
textForm.removeAttribute("action", "");
textForm.removeAttribute("method", "");

const evtSource = new EventSource(`/events/${userId}`);

evtSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.text !== undefined) {
        const newElement = document.createElement("p");
        newElement.classList.add("away");
        if (message.chatId === chatId) {
            newElement.textContent = `Message from ${message.from}: ${message.text}`;
            eventList.appendChild(newElement);
        } else {
            // TODO make push noti
        }
        // Retrieve messages for the current chat from local storage
        let allMessages = JSON.parse(localStorage.getItem(chatId)) || [];

        // Check if the message already exists in local storage
        const messageExists = allMessages.some((msg) => msg.messageId === message.messageId);

        // Store the new message in local storage only if it doesn't already exist
        if (!messageExists) {
            allMessages.push(message);
            localStorage.setItem(chatId, JSON.stringify(allMessages));
        }

        // Log all messages for debugging
        console.log("All messages from this chat:", allMessages);
    }
};

textForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const messageId = Math.random();
    const text = document.getElementById("textInput").value;
    const response = await fetch("/fact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // get the user from the url and send user id to the backend
        body: JSON.stringify({ text: text, userId: userId, chatId: chatId, messageId: messageId }),
    });
    if (response.ok) {
        console.log("Text sent successfully");
    } else {
        console.error("Failed to send text");
    }
});
