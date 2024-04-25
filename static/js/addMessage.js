const userId = getIdFromUrl("account");
const chatId = getIdFromUrl("chat");
const empty = document.querySelector(".empty");
const pfPictureProfile = document.querySelector(".profile > div:nth-of-type(1) > img").src;

if (!empty) {
    const eventList = document.querySelector(".message-box div");
    const textForm = document.querySelector(".textForm");
    textForm.removeAttribute("action", "");
    textForm.removeAttribute("method", "");
    eventList.style.scrollBehavior = "unset";
    eventList.scrollTop = eventList.scrollHeight;
    eventList.style.scrollBehavior = "smooth";

    const evtSource = new EventSource(`/events/${userId}`);

    evtSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.text !== undefined) {
            const newElement = document.createElement("p");
            const time = document.createElement("span");
            const currentTime = new Date();
            const formattedTime = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;
            time.textContent = formattedTime;
            const pfPicture = document.createElement("img");
            pfPicture.src = pfPictureProfile;

            const lastText = eventList.querySelector("p:last-child");
            console.log(lastText);

            if (message.userId === userId) {
                newElement.classList.add("away");
            } else {
                newElement.classList.add("incoming");
            }
            if (message.chatId === chatId) {
                newElement.textContent = `${message.text}`;
                // if (lastText.classList.contains("away")) {
                //     const imgToDelete = lastText.querySelector("img");
                //     imgToDelete.remove();
                //     newElement.style.marginTop = "0em";
                // }
                newElement.append(pfPicture);
                newElement.append(time);
                eventList.appendChild(newElement);
                eventList.scrollTop = eventList.scrollHeight;
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
        const currentTime = new Date();
        const formattedDateTime = currentTime.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Use 24-hour format
        });
        const messageId = Math.random();
        const text = document.getElementById("textInput");
        const textValue = text.value;
        text.value = "";
        const response = await fetch("/fact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // get the user from the url and send user id to the backend
            body: JSON.stringify({ text: textValue, userId: userId, chatId: chatId, messageId: messageId, dateTime: formattedDateTime }),
        });
        if (response.ok) {
            console.log("Text sent successfully");
        } else {
            console.error("Failed to send text");
            const errorSection = `  <section class="errorSection">
                                        <h2>An error occurred</h2>
                                        <p>Error: Failed to send your message</p>
                                    </section>`;
            document.querySelector("body main").insertAdjacentHTML("beforeend", errorSection);
        }
    });
}