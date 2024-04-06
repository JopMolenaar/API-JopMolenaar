const forms = document.querySelectorAll("form");
forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        const kindOfLink = form.id;
        let text, obj, linkToFetch, otherInfo;
        if (kindOfLink === "signUp") {
            linkToFetch = "makeAccount";
            text = form.querySelector("input[name='name']").value;
            obj = { name: text };
        } else if (kindOfLink === "logIn") {
            linkToFetch = "loginInAccount";
            text = form.querySelector("input[name='name']").value;
            obj = { name: text };
        } else if ("addContact") {
            linkToFetch = "addContact";
            text = form.querySelector("input[name='name']").value;
            otherInfo = getIdFromUrl("account");
            obj = { contact: text, userId: otherInfo };
        }
        event.preventDefault();
        postData(linkToFetch, obj);
    });
});

async function postData(linkToFetch, obj) {
    const response = await fetch(`/${linkToFetch}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // get the user from the url and send user id to the backend
        body: JSON.stringify(obj),
    });
    if (response.ok) {
        const responseInText = await response.text(); // Get the redirect URL from the response
        console.log(responseInText);
        if (responseInText.includes("Contact added successfully")) {
            // Add link with contact
            console.log("Add link with contact");
        } else {
            window.location.href = responseInText; // Redirect the user to the account page
        }
    } else {
        const text = await response.text(); // Get the redirect URL from the response
        console.error(text);
        // TODO error message
    }
}
