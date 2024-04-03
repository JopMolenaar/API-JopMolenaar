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

app.use(sirv("dist/assets"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/status", (request, response) => response.json({ clients: clients.length }));
// TODO show all chats with clients

const PORT = process.env.PORT || 4000;

let clients = [];
let facts = [];

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

app.get("/links", async (req, res) => {
    return res.send(renderTemplate("src/views/index.liquid"));
});
app.get("/account/:id", async (req, res) => {
    const clientId = req.params.id;
    console.log(clientId);
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
    console.log(clientId, chatId);
    return res.send(renderTemplate("src/views/chat.liquid"));
});

const renderTemplate = (template, data) => {
    const templateData = {
        NODE_ENV: process.env.NODE_ENV || "production",
        ...data,
    };

    return engine.renderFileSync(template, templateData);
};

function eventsHandler(request, response, next) {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };
    response.writeHead(200, headers);

    const data = `data: ${JSON.stringify(facts)}\n\n`;

    response.write(data);

    const clientId = Date.now();
    console.log(`${clientId} Connection opened`);
    const newClient = {
        id: clientId,
        response,
    };

    clients.push(newClient);

    request.on("close", () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter((client) => client.id !== clientId);
    });
}

function sendEventsToAll(newFact) {
    console.log("new fact", newFact);
    // TODO only for a couple of clients
    clients.forEach((client) => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`));
}

async function addFact(request, response, next) {
    console.log(request.body);
    const newFact = {
        ...request.body,
        clientId: 999,
    };
    facts.push(newFact);
    response.json(newFact);
    console.log("json:", newFact);
    return sendEventsToAll(newFact);
}

app.get("/events", eventsHandler);
app.post("/fact", addFact);

// import { json, urlencoded } from "body-parser";
// import { cors } from "@tinyhttp/cors";
// issues with this when writing it with tinyhttp
