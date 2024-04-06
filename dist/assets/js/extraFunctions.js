function getIdFromUrl(segment) {
    const url = window.location.href;
    const segments = url.split("/");
    const index = segments.indexOf(segment);
    return segments[index + 1]; // Return the next segment after the specified segment
}

function fillInPrevMessages() {
    const allMessages = JSON.parse(localStorage.getItem(chatId));
    if (allMessages) {
        // console.log("prev", allMessages);
        allMessages.forEach((message) => {
            const newElement = document.createElement("li");
            newElement.textContent = `Message from ${message.from}: ${message.text}`;
            eventList.appendChild(newElement);
        });
    }
}
