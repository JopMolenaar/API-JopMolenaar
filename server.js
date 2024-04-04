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
// TODO show all chats with clients

const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});

app.get("/login", async (req, res) => {
    return res.send(renderTemplate("src/views/index.liquid"));
});
app.get("/account/:id", async (req, res) => {
    const clientId = req.params.id;
    let contacts;
    contactOfClient.forEach((client) => {
        if (client.id === clientId) {
            contacts = client.contacts;
        }
    });
    return res.send(renderTemplate("src/views/account.liquid", { contactData: contacts, id: clientId }));
});
app.get("/account/:clientid/chat/:chatId", async (req, res) => {
    const clientId = req.params.clientid;
    const chatId = req.params.chatId;
    const receiverId = getReceiverId(chatId, clientId); // Extract the receiver's user ID from the chat ID
    return res.send(renderTemplate("src/views/chat.liquid", { id: receiverId }));
});

const renderTemplate = (template, data) => {
    const templateData = {
        NODE_ENV: process.env.NODE_ENV || "production",
        ...data,
    };

    return engine.renderFileSync(template, templateData);
};

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

app.get("/events/:userId", (req, res) => {
    const userId = req.params.userId;
    eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
});
app.post("/fact", addFact);

// import { json, urlencoded } from "body-parser";
// import { cors } from "@tinyhttp/cors";
// issues with this when writing it with tinyhttp
