///////////////////////////////
//////////// Setup ////////////
///////////////////////////////

require("dotenv").config();
const express = require("express");
const { Liquid } = require("liquidjs");
const sirv = require("sirv");
const bodyParser = require("body-parser");
const cors = require("cors");

const engine = new Liquid({
    extname: ".liquid",
});

const app = express();

app.use(sirv("dist/assets")); // change this to normal files with css and js
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (request, response) => response.json({ clients: clients.length }));
app.get("/showUsers", (request, response) => response.json({ users: users }));

// TODO show all chats with clients

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});

///////////////////////////////
///////// Stored data /////////
///////////////////////////////

let users = [];

let clients = [];
let facts = [];

// TODO haal uit database
const contactOfClient = [
    {
        id: "1",
        contacts: ["2", "3"],
    },
    {
        id: "2",
        contacts: ["1", "3"],
    },
    {
        id: "3",
        contacts: ["1", "2"],
    },
];

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
    const receiverId = getReceiverId(chatId, userId); // Extract the receiver's user ID from the chat ID
    const newFact = { text, userId, receiverId, chatId, messageId }; // Include receiverId in the newFact object
    facts.push(newFact);
    response.json(newFact);
    // console.log("json:", newFact);
    return sendEventsToChat(newFact, chatId); // Send message to the specific chat
}

function getReceiverId(chatId, senderId) {
    return chatId / senderId; // Calculate the receiver's user ID from the chat ID and sender's user ID
}

function sendEventsToChat(newFact, chatId) {
    clients.forEach((client) => {
        console.log("id's: ", client.userId);
    });
    clients.forEach((client) => {
        if (client.userId === newFact.userId) {
            // console.log("from user: ", newFact.userId, " for user: ", newFact.receiverId);
            // console.log("sendEventsToChat: ", "client id: ", client.id, "userId: ", client.userId, "chat id: ", chatId);

            const sender = newFact.userId;
            const receiver = newFact.receiverId;
            clients.forEach((client) => {
                console.log("user id", client.userId, "receiver: ", receiver);
                if (client.userId == receiver || client.userId == sender) {
                    console.log("send to: ", client.id);
                    client.response.write(`data: ${JSON.stringify(newFact)}\n\n`); // This sends the message to the client I think
                }
            });
        }
    });
}

function addUser(req, res) {
    const { name } = req.body;
    // Check if the user already exists
    const existingUser = users.find((user) => user.name === name);
    if (existingUser) {
        return res.status(400).send("User already exists");
    }

    // Generate a random 8-digit ID
    const id = Math.floor(10000000 + Math.random() * 90000000).toString();

    const newUser = {
        id: id,
        name: name,
        chats: [],
        contacts: [],
    };

    users.push(newUser);
    console.log("All users:", users);

    // Redirect to the account page of the new added user
    // res.redirect(`/account/${id}`);
    return res.status(200).send(`/account/${id}`);
}

function addContact(req, res) {
    const { contact, userId } = req.body;
    console.log(contact, userId);
    const userToAddContact = users.find((u) => u.id === userId);
    const contactToAdd = users.find((u) => u.name === contact);

    if (!userToAddContact || !contactToAdd) {
        return res.status(404).send("User or contact not found");
    }

    // Update chats array for both user and contact
    userToAddContact.contacts.push(contactToAdd.id);
    contactToAdd.contacts.push(userToAddContact.id);

    return res.status(201).send(`Contact added successfully: ${contactToAdd.name} & ${userToAddContact.name} are now contacts`);
}

function addChat(req, res) {
    const { contact, user } = req.body;

    const userToAddChat = users.find((u) => u.name === user);
    const contactToAddChat = users.find((u) => u.name === contact);

    if (!userToAddChat || !contactToAddChat) {
        return res.status(404).send("User or contact not found");
    }

    // Generate a random 10-digit ID for the chat
    const chatId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Update chats array for both user and contact
    userToAddChat.chats.push(chatId);
    contactToAddChat.chats.push(chatId);

    // Redirect to the chat page
    res.redirect(`/account/${userToAddChat.id}/chat/${chatId}`);
}

function verifyUser(req, res) {
    const { name } = req.body;
    const existingUser = users.find((user) => user.name === name);
    if (!existingUser) {
        return res.status(400).send("User doesn't exists");
    }

    return res.status(200).send(`/account/${existingUser.id}`);
}

///////////////////////////////
/////////// app.get ///////////
///////////////////////////////

app.get("/login", async (req, res) => {
    // person data later weghalen
    return res.send(renderTemplate("src/views/index.liquid", { persons: contactOfClient, page: "Log-in" }));
});

app.get("/signup", async (req, res) => {
    // person data later weghalen
    return res.send(renderTemplate("src/views/index.liquid", { page: "Sign-up" }));
});

app.get("/account/:id", async (req, res) => {
    const clientId = req.params.id;
    let currentUser;
    users.forEach((user) => {
        if (user.id === clientId) {
            currentUser = user;
        }
    });
    return res.send(renderTemplate("src/views/account.liquid", { user: currentUser }));
});

app.get("/account/:clientid/chat/:chatId", async (req, res) => {
    const clientId = req.params.clientid;
    const chatId = req.params.chatId;
    const receiverId = getReceiverId(chatId, clientId); // Extract the receiver's user ID from the chat ID
    return res.send(renderTemplate("src/views/chat.liquid", { id: receiverId }));
});

app.get("/events/:userId", (req, res) => {
    const userId = req.params.userId;
    eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
});

///////////////////////////////
////////// app.post ///////////
///////////////////////////////

app.post("/fact", addFact);
app.post("/makeAccount", addUser);
app.post("/loginInAccount", verifyUser);
app.post("/addContact", addContact);
app.post("/addChat", addChat);

///////////////////////////////
///// extra shit comments /////
///////////////////////////////

// import { json, urlencoded } from "body-parser";
// import { cors } from "@tinyhttp/cors";
// issues with this when writing it with tinyhttp
