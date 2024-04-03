const userId = getIdFromUrl("account");
const chatId = getIdFromUrl("chat");
const eventList = document.getElementById("eventList");

fillInPrevMessages();

const evtSource = new EventSource(`/events/${userId}`);

evtSource.onmessage = (event) => {
    console.log("got message now");
    const message = JSON.parse(event.data);
    if (message.text !== undefined) {
        const newElement = document.createElement("li");
        if (message.chatId === chatId) {
            newElement.textContent = `Message from ${message.userId}: ${message.text}`;
            eventList.appendChild(newElement);
        } else {
            // TODO make push noti
        }
        // Retrieve messages for the current chat from local storage
        let allMessages = JSON.parse(localStorage.getItem(chatId)) || [];

        // Check if the message already exists in local storage
        const messageExists = allMessages.some((msg) => msg.messageDate === message.messageDate);
        // const messageExists = allMessages.some((msg) => msg.text === message.text && msg.userId === message.userId);

        // Store the new message in local storage only if it doesn't already exist
        if (!messageExists) {
            allMessages.push(message);
            localStorage.setItem(chatId, JSON.stringify(allMessages));
        }

        // Log all messages for debugging
        console.log("All messages from this chat:", allMessages);
    }
};

document.getElementById("textForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = document.getElementById("textInput").value;
    const response = await fetch("/fact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // get the user from the url and send user id to the backend
        body: JSON.stringify({ text: text, userId: userId, chatId: chatId }),
    });
    if (response.ok) {
        console.log("Text sent successfully");
    } else {
        console.error("Failed to send text");
    }
});

function getIdFromUrl(segment) {
    const url = window.location.href;
    const segments = url.split("/");
    const index = segments.indexOf(segment);
    return segments[index + 1]; // Return the next segment after the specified segment
}

function fillInPrevMessages() {
    const allMessages = JSON.parse(localStorage.getItem(chatId));
    if (allMessages) {
        console.log("prev", allMessages);
        allMessages.forEach((message) => {
            const newElement = document.createElement("li");
            newElement.textContent = `Message from ${message.userId}: ${message.text}`;
            eventList.appendChild(newElement);
        });
    }
}

// localStorage.clear();
