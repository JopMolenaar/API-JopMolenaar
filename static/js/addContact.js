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

// async function checkForChat() {
//     const allLiData = [];
//     const allIds = contactList.querySelectorAll("li");

//     allIds.forEach((li) => {
//         const user = li.querySelector("input[name=user]");
//         const contact = li.querySelector("input[name=contact]");
//         const textContentWithoutSpaces = li.textContent.trim().replace(/\s+/g, " ");

//         if (user && contact) {
//             const data = { user: userId, contact: contact.value, name: textContentWithoutSpaces };
//             allLiData.push(data);
//         } else {
//             allLiData.push({ user: userId, name: textContentWithoutSpaces });
//         }
//     });

//     if (allLiData[0]) {
//         // try {
//         const response = await fetch("/checkForChat", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(allLiData),
//         });
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         const theActdata = data.dataToReturn[0];
//         console.log(theActdata);
//         if (theActdata.message === "New contact") {
//             console.log("NEW:", theActdata.contact);
//             //     const html = `<li>${theActdata.contact.name}
//             //                      <form action="/addChat" method="post">
//             //                       <input type="hidden" name="user" value="${userId}">
//             //                          <input type="hidden" name="contact" value="${theActdata.contact.id}">
//             //                 <button type="submit">New chat</button>
//             //                       </form>
//             //                   </li>`;
//             //     contactList.insertAdjacentHTML("beforeend", html);
//         }
//         // } catch (error) {
//         //     console.error("Error fetching data:", error.message);
//         //     // TODO: Handle error message display
//         // }
//     } else {
//         //     console.log("No data to send to server");
//         //     // TODO: Handle scenario where no data is available to send
//     }
// }

// checkForChat();
// setInterval(checkForChat, 5000);
