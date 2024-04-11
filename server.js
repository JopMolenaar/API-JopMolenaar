///////////////////////////////
//////////// Setup ////////////
///////////////////////////////

require("dotenv").config();
const express = require("express");
const { Liquid } = require("liquidjs");
const sirv = require("sirv");
const bodyParser = require("body-parser");
const cors = require("cors");
const webpush = require("web-push");

const vapidKeys = {
    publicKey: "BNvTbER8XgCTGxnGOVRLnnCfHA5WdTfe51CEHtGBAVeJuDbtsGjojizJIe-hgDbNda_zevi3cv_mf9Z642JcqP8",
    privateKey: process.env.PRIVATE_VAPID_KEY,
};

webpush.setVapidDetails(`mailto:${process.env.MAIL}`, vapidKeys.publicKey, vapidKeys.privateKey);

const engine = new Liquid({
    extname: ".liquid",
});

const app = express();

app.use(sirv("static"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (request, response) => response.json({ users: users, facts: facts, allSubscribers: allSubscribers }));
app.get("/showUsers", (request, response) => response.json({ users: users }));

// TODO add password in data and make a session id?

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});

///////////////////////////////
///////// Stored data /////////
///////////////////////////////
let clients = [];
let chats = [
    {
        id: "3889220298",
    },
];
let users = [
    {
        id: "65956570",
        name: "Mink",
        chats: [
            {
                id: "3889220298",
                name: "Jop",
            },
        ],
        contacts: [
            {
                id: "37157981",
                name: "Jop",
                existingChat: true,
            },
        ],
    },
    {
        id: "37157981",
        name: "Jop",
        chats: [
            {
                id: "3889220298",
                name: "Mink",
            },
        ],
        contacts: [
            {
                id: "65956570",
                name: "Mink",
                existingChat: true,
            },
        ],
    },
];
let facts = [
    {
        text: "Hoi Mink",
        userId: "37157981",
        receiverId: "65956570",
        from: "Jop",
        chatId: "3889220298",
        messageId: 0.148236156069004,
    },
    {
        text: "Hoi Jop",
        userId: "65956570",
        receiverId: "37157981",
        from: "Mink",
        chatId: "3889220298",
        messageId: 0.891413494111438,
    },
];
let allSubscribers = [];
///////////////////////////////
////////// Functions //////////
///////////////////////////////

function renderTemplate(template, data) {
    const templateData = {
        NODE_ENV: process.env.NODE_ENV || "production",
        ...data,
    };
    return engine.renderFileSync(template, templateData);
}

function eventsHandler(request, response, userId) {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };
    response.writeHead(200, headers);

    clients.forEach((client) => {
        if (client.userId === userId) {
            const dupliId = client.userId;
            console.log(`${dupliId} Connection closed`);
            clients = clients.filter((client) => client.userId !== dupliId);
        }
    });

    console.log(`User: ${userId} Connection opened`);

    const data = `data: ${JSON.stringify(facts)}\n\n`;

    response.write(data);

    const clientId = Date.now();
    console.log(`${clientId} Connection opened`);
    const newClient = {
        userId: userId,
        id: clientId,
        response,
    };

    clients.push(newClient);

    request.on("close", () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter((client) => client.id !== clientId);
    });
}

async function addFact(request, response, next) {
    const { text, userId, chatId, messageId } = request.body;
    const senderName = users.find((u) => u.id === userId);
    const from = senderName.name;
    const currentReceiver = users.find((u) => u.chats.find((chat) => chat.id === chatId && u.id !== userId));
    const receiverId = currentReceiver.id;
    const newFact = { text, userId, receiverId, from, chatId, messageId }; // Include receiverId in the newFact object
    facts.push(newFact);
    sendEventsToChat(newFact, chatId); // Send message to the specific chat
    sendPushNoti(request.body, receiverId);
    return { newFact, redirect: `/account/${userId}/chat/${chatId}` };
}

function sendEventsToChat(newFact, chatId) {
    clients.forEach((client) => {
        console.log("id's: ", client.userId);
    });
    clients.forEach((client) => {
        if (client.userId === newFact.userId) {
            console.log("New fact:", newFact);
            const sender = newFact.userId;
            const receiver = newFact.receiverId;
            clients.forEach((client) => {
                console.log("user id", sender, "receiver:", receiver);
                if (client.userId == receiver || client.userId == sender) {
                    console.log("send to: ", client.id);
                    client.response.write(`data: ${JSON.stringify(newFact)}\n\n`); // This sends the message to the client I think
                }
            });
        }
    });
}

function generateUniqueId(array) {
    let id;
    do {
        // Generate a random 8-digit ID
        id = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (array.some((element) => element.id === id)); // Check if ID already exists in users array
    return id;
}

function addUser(req, res) {
    const { name } = req.body;
    // Check if the user already exists
    const existingUser = users.find((user) => user.name === name);
    if (existingUser) {
        return res.send(renderTemplate("src/views/index.liquid", { page: "Sign-up", errorMessage: `User: ${name} already exists`, inputValue: name }));
    }

    // Generate a unique ID for the new user
    const id = generateUniqueId(users);
    const newUser = {
        id: id,
        name: name,
        chats: [],
        contacts: [],
    };

    users.push(newUser);
    console.log("All users:", users);

    // Redirect to the account page of the new added user
    return res.redirect(`/account/${id}`);
}

function addContact(req, res) {
    const { name, userId } = req.body;
    console.log(name, userId);
    const userToAddContact = users.find((u) => u.id === userId);
    const contactToAdd = users.find((u) => u.name === name);
    if (contactToAdd === userToAddContact) {
        return { status: 400, message: "You cant add yourself", error: true };
    }
    if (!userToAddContact || !contactToAdd) {
        const errorMessage = encodeURIComponent("User or contact not found");
        return { status: 400, message: "User or contact not found", error: true };
    }
    const contactExists = userToAddContact.contacts.find((c) => c === contactToAdd.id);
    const contactExistsInContact = contactToAdd.contacts.find((c) => c === userToAddContact.id);
    if (!contactExists && !contactExistsInContact) {
        // Update chats array for both user and contact
        const newContactForUser = {
            id: contactToAdd.id,
            name: contactToAdd.name,
            existingChat: false,
        };
        const newContact = {
            id: userToAddContact.id,
            name: userToAddContact.name,
            existingChat: false,
        };
        userToAddContact.contacts.push(newContactForUser);
        contactToAdd.contacts.push(newContact);
    } else {
        return { status: 400, message: "Contact already exists", error: true };
    }

    return { status: 201, message: "contact added succesfully", userId: userToAddContact.id, contactId: contactToAdd.id, contactName: contactToAdd.name };
}

function addChat(req, res) {
    const { contact, user } = req.body;

    const userToAddChat = users.find((u) => u.id === user);
    const contactToAddChat = users.find((u) => u.id === contact);

    if (!userToAddChat || !contactToAddChat) {
        return res.status(404).send("User or contact not found");
    }

    // Generate a random 10-digit ID for the chat
    const chatId = generateUniqueId(chats);
    chats.push({ id: chatId });
    const newChatUser = {
        id: chatId,
        name: contactToAddChat.name,
    };
    const newChatContact = {
        id: chatId,
        name: userToAddChat.name,
    };
    const setChatToTrueContact = contactToAddChat.contacts.find((c) => c.id === userToAddChat.id);
    const setChatToTrueUser = userToAddChat.contacts.find((c) => c.id === contactToAddChat.id);
    setChatToTrueContact.existingChat = true;
    setChatToTrueUser.existingChat = true;
    // Update chats array for both user and contact
    userToAddChat.chats.push(newChatUser);
    contactToAddChat.chats.push(newChatContact);

    // Redirect to the chat page
    return res.redirect(`/account/${userToAddChat.id}/chat/${chatId}`);
}

function verifyUser(req, res) {
    const { name } = req.body;
    const existingUser = users.find((user) => user.name === name);
    if (!existingUser) {
        return res.send(renderTemplate("src/views/index.liquid", { page: "Log-in", errorMessage: `User: ${name} doesn't exists`, inputValue: name }));
    }
    return res.redirect(`/account/${existingUser.id}`);
}

function isValidSaveRequest(req, res) {
    console.log("VALIDATE");
    // Check the request body has at least an endpoint.
    if (!req.body || !req.body.endpoint) {
        console.log("FALSE");
        // Not a valid subscription.
        res.status(400);
        res.setHeader("Content-Type", "application/json");
        res.send(
            JSON.stringify({
                error: {
                    id: "no-endpoint",
                    message: "Subscription must have an endpoint.",
                },
            })
        );
        return false;
    }
    return true;
}

function getSubscriptionsFromDatabase(id) {
    console.log("GET SUB");
    let subscribersToResolve = [];
    return new Promise((resolve, reject) => {
        console.log("allSubscribers: ", allSubscribers);
        allSubscribers.forEach((sub) => {
            console.log(sub.id, id);
            if (sub.userId === id) {
                subscribersToResolve.push(sub);
            }
        });
        resolve(subscribersToResolve);
    });
}

function triggerPushMsg(subscription, dataToSend) {
    console.log("TRIGGER PUSH MSG", subscription.subscription, dataToSend);
    return webpush.sendNotification(subscription.subscription, dataToSend).catch((err) => {
        if (err.statusCode === 410) {
            console.log("ERROR", err.statusCode, "ID", subscription._id);
            // return deleteSubscriptionFromDatabase(subscription._id);
            return "Error";
        } else {
            console.log("ERROR STATUS CODE:", err.statusCode);
            console.log("Subscription is no longer valid: ", err);
        }
    });
}

function saveSubscriptionToDatabase(subscription, userId) {
    console.log("SAVE SUB", userId);
    return new Promise((resolve, reject) => {
        const id = generateUniqueId(allSubscribers);
        const newSubscriber = {
            subscription: subscription,
            id: id,
            userId: userId,
        };
        allSubscribers.push(newSubscriber);
        resolve(id); // Resolve with the generated ID
    });
}

function sendPushNoti(data, sendTo) {
    // const { title, body, icon, userId } = data;
    const { text, userId, icon } = data;
    const dataToSend = { title: "Message from someone", body: text, icon };
    const payload = JSON.stringify(dataToSend);
    // TODO = logic to send it to the right person if that person is not online
    return getSubscriptionsFromDatabase(sendTo).then(function (subscriptions) {
        console.log("SUBS:", subscriptions);
        let promiseChain = Promise.resolve();
        let doubleDev = [];
        for (let i = 0; i < subscriptions.length; i++) {
            if (!doubleDev.includes(subscriptions[i].subscription.endpoint)) {
                // TODO if subscription.subscription.endpoint already exists in a array, don't send it.
                const subscription = subscriptions[i];
                doubleDev.push(subscriptions[i].subscription.endpoint);
                promiseChain = promiseChain.then(() => {
                    return triggerPushMsg(subscription, payload);
                });
            }
        }

        // return promiseChain;
        // redirect to the current chat page
        // return res.redirect(`/account/${userId}`);
    });
}
///////////////////////////////
/////////// app.get ///////////
///////////////////////////////

app.get("/login", async (req, res) => {
    return res.send(renderTemplate("src/views/index.liquid", { page: "Log-in" }));
});

app.get("/signup", async (req, res) => {
    return res.send(renderTemplate("src/views/index.liquid", { page: "Sign-up" }));
});

app.get("/account/:id", async (req, res) => {
    const error = req.query.error; // Retrieve error message from query parameter
    const clientId = req.params.id;
    let currentUser;
    if (!users[0]) {
        return res.send(renderTemplate("src/views/notFound.liquid"));
    } else {
        currentUser = users.find((u) => u.id === clientId);
        if (currentUser !== undefined) {
            if (error) {
                return res.send(renderTemplate("src/views/account.liquid", { user: currentUser, error }));
            }
            return res.send(renderTemplate("src/views/account.liquid", { user: currentUser }));
        } else {
            return res.send(renderTemplate("src/views/notFound.liquid"));
        }
    }
});

app.get("/account/:id/chat/:chatId", async (req, res) => {
    const clientId = req.params.id;
    const chatId = req.params.chatId;
    const currentUser = users.find((u) => u.id === clientId);
    const currentContact = users.find((u) => u.chats.find((chat) => chat.id === chatId && u.id !== clientId));
    if (currentUser && currentContact) {
        let allChats = [];
        console.log("facts:", facts);
        facts.forEach((fact) => {
            if (fact.chatId === chatId) {
                allChats.push(fact);
            }
        });
        return res.send(renderTemplate("src/views/chat.liquid", { contact: currentContact, chats: allChats, currentUser, chatId }));
    } else {
        return res.send(renderTemplate("src/views/notFound.liquid"));
    }
});

app.get("/events/:userId", (req, res) => {
    const userId = req.params.userId;
    const currentUser = users.find((u) => u.id === userId);
    if (currentUser) {
        eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
    } else {
        return res.status(400).send("User doesn't exists");
    }
});

app.get("/account/:id/makeChatWith/:contactId", (req, res) => {
    const userId = req.params.userId;
    const currentUser = users.find((u) => u.id === userId);
    if (currentUser) {
        eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
    } else {
        return res.status(400).send("User doesn't exists");
    }
});

///////////////////////////////
////////// app.post ///////////
///////////////////////////////

// app.post("/checkForChat", (req, res) => {
//     let dataToReturn = [];
//     const allData = req.body;
//     if (allData[0]) {
//         allData.forEach((data) => {
//             const foundUser = users.find((u) => u.id === data.user);
//             console.log("FOUND USER:", foundUser.name, "LI DATA CONTACTS:", data);
//             let foundContact;
//             if (data.contact) {
//                 // TODO check if there is an existing chat
//             } else {
//                 // TODO check if there is a new contact
//                 const newContact = foundUser.contacts.find((c) => c.name !== data.name);
//                 if (newContact) {
//                     dataToReturn.push({ message: "New contact", contact: newContact });
//                     console.log("NEW CONTACT:", newContact);
//                 } else {
//                     dataToReturn.push({ message: "No new contact" });
//                 }
//                 return res.status(200).send({ dataToReturn });
//             }
//         });
//         return res.status(200).send({ message: "content send" });
//     }
//     return res.status(200).send({ message: "no content send" });
// });

app.post("/fact", async (req, res) => {
    const response = await addFact(req, res);
    console.log(response);
    // sendPushNoti(req.body);
    res.json(response.newFact);
});
app.post("/addMessageWithRefresh", async (req, res) => {
    const { text, userId, chatId, messageId } = req.body;
    const response = await addFact(req, res);
    console.log(response);
    return res.redirect(`/account/${userId}/chat/${chatId}`);
});

app.post("/makeAccount", addUser);
app.post("/loginInAccount", verifyUser);

app.post("/addContact", async (req, res) => {
    const { contact, userId } = req.body;
    const response = await addContact(req, res);
    if (response.error) {
        const errorMessage = encodeURIComponent(response.message);
        return res.redirect(`/account/${userId}?error=${errorMessage}`);
    } else {
        return res.redirect(`/account/${userId}`);
    }
});
app.post("/addContactJs", async (req, res) => {
    const response = await addContact(req, res);
    console.log(response);
    return res.status(200).send(response);
});
app.post("/addChat", addChat);

app.post("/save-subscription/:id", function (req, res) {
    const userId = req.params.id;
    console.log(userId);
    // const { userId, subscription } = req.body;
    // console.log(req.body);
    // console.log("User id:", userId);
    if (!isValidSaveRequest(req, res)) {
        return;
    }
    try {
        // const subscriptionData = JSON.parse(req.body);
        // console.log(subscriptionData);
        return saveSubscriptionToDatabase(req.body, userId)
            .then((subscriptionId) => {
                res.setHeader("Content-Type", "application/json");
                res.send(JSON.stringify({ data: { success: true } }));
            })
            .catch(function (err) {
                res.status(500);
                res.setHeader("Content-Type", "application/json");
                res.send(
                    JSON.stringify({
                        error: {
                            id: "unable-to-save-subscription",
                            message: "The subscription was received but we were unable to save it to our database.",
                        },
                    })
                );
            });
    } catch (error) {
        // Handle JSON parsing error
        console.error("Error parsing JSON:", error.message);
        res.status(400).send("Invalid JSON data");
    }
});

///////////////////////////////
///// extra shit comments /////
///////////////////////////////

// import { json, urlencoded } from "body-parser";
// import { cors } from "@tinyhttp/cors";
// issues with this when writing it with tinyhttp
