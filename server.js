///////////////////////////////
//////////// Setup ////////////
///////////////////////////////

require("dotenv").config();
const express = require("express");
const app = express();
const { Liquid } = require("liquidjs");
const sirv = require("sirv");
const bodyParser = require("body-parser");
const cors = require("cors");
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const axios = require("axios");

// Define the upload directory path relative to the project root
const uploadDirectory = path.join(__dirname, "static/uploads");

// Ensure that the upload directory exists; create it if it doesn't
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2000, // 2 KB
    },
});

const vapidKeys = {
    publicKey: "BNvTbER8XgCTGxnGOVRLnnCfHA5WdTfe51CEHtGBAVeJuDbtsGjojizJIe-hgDbNda_zevi3cv_mf9Z642JcqP8",
    privateKey: process.env.PRIVATE_VAPID_KEY,
};

webpush.setVapidDetails(`mailto:${process.env.MAIL}`, vapidKeys.publicKey, vapidKeys.privateKey);

const engine = new Liquid({
    extname: ".liquid",
});

app.use(sirv("static"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// TODO add password in data and make a session id?

const PORT = process.env.PORT || 4000;

///////////////////////////////
/////// DATABASES (json) //////
///////////////////////////////
const usersDB = "database/users.json";
const chatsDB = "database/chats.json";
const subsDB = "database/subs.json";
const messagesDB = "database/messages.json";
const accessToken = process.env.ACCESSTOKEN;
const repositoryName = process.env.REPONAME;
let clients = [];

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});

///////////////////////////////
////////// Functions //////////
///////////////////////////////
async function loadJSON(filePath) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repositoryName}/contents/${filePath}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            const { content } = response.data; // Extract content
            const decodedContent = Buffer.from(content, "base64").toString("utf-8");
            const jsonData = JSON.parse(decodedContent); // Parse decoded content into JSON
            return jsonData;
        } else {
            throw new Error(`Failed to read data: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error reading data from GitHub:", error.message);
        return null;
    }
}

async function readDataFromGitHub(repositoryName, filePath, accessToken) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repositoryName}/contents/${filePath}`, {
            headers: {
                Authorization: `token ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            const { sha, content } = response.data; // Extract sha and content
            const decodedContent = Buffer.from(content, "base64").toString("utf-8");
            return { sha, content: decodedContent };
        } else {
            throw new Error(`Failed to read data: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error reading data from GitHub:", error.message);
        return null;
    }
}

async function saveJSON(filePath, data) {
    // console.log("save filename:", filename);
    // return fs.writeFileSync(filename, JSON.stringify(json));

    try {
        // console.log(data);
        const existingData = await readDataFromGitHub(repositoryName, filePath, accessToken);
        const content = JSON.stringify(data, null, 2);
        const encodedContent = Buffer.from(content).toString("base64");

        const body = {
            message: "Update data.json",
            content: encodedContent,
            sha: existingData ? existingData.sha : undefined, // Use existing SHA if available for update
        };

        if (!existingData || !existingData.sha) {
            throw new Error("Unable to retrieve existing file SHA.");
        }

        const response = await axios.put(`https://api.github.com/repos/${repositoryName}/contents/${filePath}`, body, {
            headers: {
                Authorization: `token ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            console.log("Data successfully written to GitHub repository.");
            return response;
        } else {
            throw new Error(`Failed to write data: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error writing data to GitHub:", error.message);
    }
}

function renderTemplate(template, data) {
    const templateData = {
        NODE_ENV: process.env.NODE_ENV || "production",
        ...data,
    };
    return engine.renderFileSync(template, templateData);
}

async function eventsHandler(request, response, userId) {
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
    const messages = await loadJSON(messagesDB);
    const data = `data: ${JSON.stringify(messages)}\n\n`;

    response.write(data);

    const clientId = Date.now();
    console.log(`${clientId} Connection opened`);
    const newClient = {
        userId: userId,
        id: clientId,
        response,
    };

    const usersJSON = await loadJSON(usersDB);

    const currentUser = usersJSON.find((user) => user.id == userId);
    if (currentUser) {
        currentUser.status = "Online";
        saveJSON(usersDB, usersJSON);
    }

    clients.push(newClient);

    request.on("close", async () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter((client) => client.id !== clientId);
        const currentUser = usersJSON.find((user) => user.id == userId);
        if (currentUser) {
            // console.log("SET STATUS TO Offline");
            currentUser.status = "Offline";
            saveJSON(usersDB, usersJSON);
        }
    });
    // console.log("clients:", clients);
    // saveJSON(usersDB, usersJSON);
}

async function addFact(request, response, next) {
    const { text, userId, chatId, messageId, dateTime } = request.body;
    const usersJSON = await loadJSON(usersDB);
    const senderName = usersJSON.find((u) => u.id === userId);
    const from = senderName.name;
    const currentReceiver = usersJSON.find((u) => u.chats.find((chat) => chat.id === chatId && u.id !== userId));
    const receiverId = currentReceiver.id;
    const newFact = { text, userId, receiverId, from, chatId, messageId, dateTime }; // Include receiverId in the newFact object
    const messages = await loadJSON(messagesDB);
    messages.push(newFact);
    saveJSON(messagesDB, messages);
    // const response2 = await saveJSON(usersDB, usersJSON);
    sendEventsToChat(newFact, chatId); // Send message to the specific chat

    if (currentReceiver.status === "Offline") {
        sendPushNoti(request.body, receiverId);
    }

    return { newFact, redirect: `/account/${userId}/chat/${chatId}` };
}

async function sendEventsToChat(newFact, chatId) {
    // const clients = await loadJSON(clientsDB);
    clients.forEach((client) => {
        // console.log("id's: ", client.userId);
    });
    clients.forEach((client) => {
        if (client.userId === newFact.userId) {
            // console.log("New fact:", newFact);
            const sender = newFact.userId;
            const receiver = newFact.receiverId;
            clients.forEach((client) => {
                // console.log("user id", sender, "receiver:", receiver);
                if (client.userId == receiver || client.userId == sender) {
                    // console.log("send to: ", client.id);
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

async function addUser(req, res) {
    const { name } = req.body;

    const usersJSON = await loadJSON(usersDB);
    // Check if the user already exists
    const existingUser = usersJSON.find((user) => user.name === name);
    if (existingUser) {
        return res.send(renderTemplate("src/views/index.liquid", { page: "Sign-up", errorMessage: `User: ${name} already exists`, inputValue: name }));
    }

    // Generate a unique ID for the new user
    const id = generateUniqueId(usersJSON);
    const newUser = {
        id: id,
        name: name,
        status: "Offline",
        chats: [],
        contacts: [],
        pfPicture: "/images/profileDefault.png",
    };

    usersJSON.push(newUser);
    // console.log("All users:", usersJSON);
    const response = await saveJSON(usersDB, usersJSON);
    // Redirect to the account page of the new added user
    return res.redirect(`/account/${id}`);
}

async function addContact(req, res) {
    const { name, userId } = req.body;

    const usersJSON = await loadJSON(usersDB);
    // console.log("USERS: ", usersJSON);

    // console.log(name, userId);
    let chatId;
    const userToAddContact = usersJSON.find((u) => u.id === userId);
    const contactToAdd = usersJSON.find((u) => u.name === name);
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

        chatId = await addChat(contactToAdd, userToAddContact, usersJSON);
        const response = await saveJSON(usersDB, usersJSON);
    } else {
        return { status: 400, message: "Contact already exists", error: true };
    }
    return {
        status: 201,
        message: "contact added succesfully",
        userId: userToAddContact.id,
        contactId: contactToAdd.id,
        contactName: contactToAdd.name,
        chatId,
    };
}

async function addChat(contactToAddChat, userToAddChat, usersJSON) {
    // console.log("ADD CHAT");
    const chats = await loadJSON(chatsDB);
    // Generate a random 10-digit ID for the chat
    const chatId = generateUniqueId(chats);
    // console.log("CHAT:", chatId);
    chats.push({ id: chatId });
    const response = await saveJSON(chatsDB, chats);
    const newChatUser = {
        id: chatId,
        name: contactToAddChat.name,
        contactId: contactToAddChat.id,
        pfPicture: contactToAddChat.pfPicture,
    };
    const newChatContact = {
        id: chatId,
        name: userToAddChat.name,
        contactId: userToAddChat.id,
        pfPicture: userToAddChat.pfPicture,
    };
    const setChatToTrueContact = contactToAddChat.contacts.find((c) => c.id === userToAddChat.id);
    const setChatToTrueUser = userToAddChat.contacts.find((c) => c.id === contactToAddChat.id);
    setChatToTrueContact.existingChat = true;
    setChatToTrueUser.existingChat = true;
    // Update chats array for both user and contact
    userToAddChat.chats.push(newChatUser);
    contactToAddChat.chats.push(newChatContact);
    const response2 = await saveJSON(usersDB, usersJSON);
    return chatId;
}

async function verifyUser(req, res) {
    const { name } = req.body;
    const usersJSON = await loadJSON(usersDB);
    const existingUser = usersJSON.find((user) => user.name === name);
    if (!existingUser) {
        return res.send(renderTemplate("src/views/index.liquid", { page: "Log-in", errorMessage: `User: ${name} doesn't exists`, inputValue: name }));
    }
    return res.redirect(`/account/${existingUser.id}`);
}

function isValidSaveRequest(req, res) {
    // console.log("VALIDATE");
    // Check the request body has at least an endpoint.
    if (!req.body || !req.body.endpoint) {
        // console.log("FALSE");
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
    // console.log("GET SUB");
    let subscribersToResolve = [];
    let dontSendTwice = [];
    return new Promise((resolve, reject) => {
        loadJSON(subsDB)
            .then((allSubscribers) => {
                if (allSubscribers) {
                    allSubscribers.forEach((sub) => {
                        // console.log(sub.userId, id);
                        if (sub.userId === id) {
                            // console.log("SUB", sub);
                            if (dontSendTwice[0]) {
                                dontSendTwice.forEach((subTwice) => {
                                    if (subTwice.id !== sub.id && subTwice.endpoint !== sub.endpoint) {
                                        subscribersToResolve.push(sub);
                                        // console.log("Send to: ", sub.userId);
                                        dontSendTwice.push(sub);
                                    }
                                });
                            } else {
                                subscribersToResolve.push(sub);
                                // console.log("Send to: ", sub.userId);
                                dontSendTwice.push(sub);
                            }
                        }
                    });
                    resolve(subscribersToResolve);
                } else {
                    console.log("File does not exist or is empty.");
                }
            })
            .catch((error) => {
                console.error("Error loading or saving JSON:", error);
            });
    });
}

function deleteSubscriptionFromDatabase(id) {
    loadJSON(subsDB)
        .then((allSubscribers) => {
            if (allSubscribers) {
                allSubscribers.forEach(async (sub) => {
                    if (sub.id === id) {
                        const index = allSubscribers.indexOf(sub);
                        if (index > -1) {
                            // only splice array when item is found
                            allSubscribers.splice(index, 1); // 2nd parameter means remove one item only
                        }
                        // Save updated JSON data to file
                        const response = await saveJSON(subsDB, allSubscribers);
                        console.log("JSON data saved successfully.");
                    }
                });
            } else {
                console.log("File does not exist or is empty.");
            }
        })
        .catch((error) => {
            console.error("Error loading or saving JSON:", error);
        });
}

function triggerPushMsg(subscription, dataToSend) {
    // console.log("TRIGGER PUSH MSG", subscription.subscription, dataToSend);
    return webpush.sendNotification(subscription.subscription, dataToSend).catch((err) => {
        if (err.statusCode === 410) {
            console.log("ERROR", err.statusCode, "ID", subscription.id);
            return deleteSubscriptionFromDatabase(subscription.id);
        } else {
            console.log("ERROR STATUS CODE:", err.statusCode);
            console.log("Subscription is no longer valid: ", err);
        }
    });
}

function saveSubscriptionToDatabase(subscription, userId) {
    // console.log("SAVE SUB", userId);
    return new Promise((resolve, reject) => {
        loadJSON(subsDB)
            .then(async (allSubscribers) => {
                if (allSubscribers) {
                    allSubscribers.forEach((sub) => {
                        // console.log(sub.id, id);
                        // if (sub.userId === userId && subscription.endpoint === sub.subscription.endpoint) {
                        //     console.log("THIS ACCOUNT IS ALREADY GETTING NOTIFICATIONS");
                        // } else {
                        //     console.log("NOT ALREADY GETTING NOTIFICATIONS");
                        // }
                    });
                    const id = generateUniqueId(allSubscribers);
                    const newSubscriber = {
                        subscription: subscription,
                        id: id,
                        userId: userId,
                    };
                    allSubscribers.push(newSubscriber);
                    // Save updated JSON data to file
                    const response = await saveJSON(subsDB, allSubscribers);
                    console.log("JSON data saved successfully.");
                    resolve(id); // Resolve with the generated ID
                } else {
                    console.log("File does not exist or is empty.");
                }
            })
            .catch((error) => {
                console.error("Error loading or saving JSON:", error);
            });
    });
}

async function sendPushNoti(data, sendTo) {
    const { text, userId, icon } = data;
    const usersJSON = await loadJSON(usersDB);
    // console.log("userJson: ", usersJSON);
    const currentUser = usersJSON.find((u) => u.id === userId);
    const dataToSend = { title: `Message from ${currentUser.name}`, body: text, icon };
    const payload = JSON.stringify(dataToSend);
    return getSubscriptionsFromDatabase(sendTo).then(function (subscriptions) {
        // console.log("SUBS:", subscriptions);
        let promiseChain = Promise.resolve();
        let doubleDev = [];
        for (let i = 0; i < subscriptions.length; i++) {
            const subscription = subscriptions[i];
            doubleDev.push(subscriptions[i].subscription.endpoint);
            promiseChain = promiseChain.then(() => {
                return triggerPushMsg(subscription, payload);
            });
        }
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
    const clientId = req.params.id;
    let currentUser;
    const usersJSON = await loadJSON(usersDB);
    if (!usersJSON[0]) {
        return res.send(renderTemplate("src/views/notFound.liquid"));
    } else {
        currentUser = usersJSON.find((u) => u.id === clientId);
        if (currentUser !== undefined) {
            let showNotification = false;
            return res.send(renderTemplate("src/views/chat.liquid", { currentUser: currentUser, showNotification, chatOpen: false }));
        } else {
            return res.send(renderTemplate("src/views/notFound.liquid"));
        }
    }
});

app.get("/account/:id/chat/:chatId", async (req, res) => {
    const clientId = req.params.id;
    const chatId = req.params.chatId;
    const usersJSON = await loadJSON(usersDB);
    const currentUser = usersJSON.find((u) => u.id === clientId);
    const currentContact = usersJSON.find((u) => u.chats.find((chat) => chat.id === chatId && u.id !== clientId));
    if (currentUser && currentContact) {
        let allChats = [];
        // console.log("facts:", facts);
        const messages = await loadJSON(messagesDB);
        messages.forEach((fact) => {
            if (fact.chatId === chatId) {
                let direction;
                if (fact.userId === clientId) {
                    direction = "away";
                } else {
                    direction = "incoming";
                }
                allChats.push({ fact, direction });
                // console.log(allChats);
            }
        });
        let showNotification = true;
        // const notification = await getNotificationStatus(clientId);
        loadJSON(subsDB)
            .then((data) => {
                if (data) {
                    const foundData = data.find((u) => u.userId === clientId);
                    if (foundData) {
                        showNotification = false;
                    }
                } else {
                    console.log("File does not exist or is empty.");
                }
                // console.log("NOTI header?:", showNotification);
                return res.send(
                    renderTemplate("src/views/chat.liquid", { contact: currentContact, chats: allChats, currentUser, chatId, showNotification, chatOpen: true })
                );
            })
            .catch((error) => {
                console.error("Error loading or saving JSON:", error);
            });
    } else {
        return res.send(renderTemplate("src/views/notFound.liquid"));
    }
});

app.get("/events/:userId", async (req, res) => {
    const userId = req.params.userId;
    const usersJSON = await loadJSON(usersDB);
    // console.log("userJson: ", usersJSON);
    const currentUser = usersJSON.find((u) => u.id === userId);
    if (currentUser) {
        eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
    } else {
        return res.status(400).send("User doesn't exists");
    }
});

app.get("/account/:id/makeChatWith/:contactId", async (req, res) => {
    const userId = req.params.userId;
    const usersJSON = await loadJSON(usersDB);
    // console.log("userJson: ", usersJSON);
    const currentUser = usersJSON.find((u) => u.id === userId);
    if (currentUser) {
        eventsHandler(req, res, userId); // Pass the user ID to eventsHandler
    } else {
        return res.status(400).send("User doesn't exists");
    }
});

app.get("/status", async (request, response) => {
    const usersJSON = await loadJSON(usersDB);
    const messages = await loadJSON(messagesDB);
    const subs = await loadJSON(subsDB);
    response.json({ users: usersJSON, facts: messages, allSubscribers: subs });
});

app.get("/showUsers", async (request, response) => {
    const usersJSON = await loadJSON(usersDB);
    response.json({ users: usersJSON });
});

app.get("/getStatusContact/:id", async (req, res) => {
    const contactId = req.params.id;
    const usersJSON = await loadJSON(usersDB);
    // console.log(usersJSON);
    const currentContact = usersJSON.find((user) => user.id === contactId);
    if (currentContact) {
        const status = currentContact.status;
        res.json({ status });
    } else {
        return res.status(400).send("Can't read currentContact.status");
    }
});

app.get("/getAllContacts/:id", async (req, res) => {
    const userId = req.params.id;
    const usersJSON = await loadJSON(usersDB);
    if (!usersJSON) {
        return res.status(500).send("There is an error");
    }
    const currentUser = usersJSON.find((user) => user.id === userId);
    if (currentUser) {
        const contacts = currentUser.contacts;
        const promises = contacts.map(async (contact) => {
            const chat = await currentUser.chats.find((c) => c.contactId === contact.id);
            const pfPicture = chat.pfPicture;
            const chatId = chat ? chat.id : null; // Check if chat exists
            return { contact, chatId, pfPicture };
        });

        // Wait for all promises to resolve
        Promise.all(promises)
            .then((allContacts) => {
                res.json({ allContacts });
            })
            .catch((error) => {
                console.error("Error processing contacts:", error);
                res.status(500).json({ error: "Failed to process contacts" });
            });
    } else {
        return res.status(500).send("There is an error");
    }
});

///////////////////////////////
////////// app.post ///////////
///////////////////////////////

app.post("/fact", async (req, res) => {
    const response = await addFact(req, res);
    res.json(response.newFact);
});
app.post("/addMessageWithRefresh", async (req, res) => {
    const { text, userId, chatId, messageId, dateTime } = req.body;
    const response = await addFact(req, res);
    // console.log(response);
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
    // console.log("response add contact:", response);
    return res.status(200).send(response);
});

app.post("/save-subscription/:id", function (req, res) {
    const userId = req.params.id;
    // console.log("UID save sub", userId);
    if (!isValidSaveRequest(req, res)) {
        return;
    }
    try {
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

app.post("/delete-subscription/:id", function (req, res) {
    const userId = req.params.id;
    loadJSON(subsDB)
        .then((allSubscribers) => {
            if (allSubscribers) {
                allSubscribers.forEach(async (sub) => {
                    if (sub.userId === userId) {
                        const index = allSubscribers.indexOf(sub);
                        if (index > -1) {
                            // only splice array when item is found
                            allSubscribers.splice(index, 1); // 2nd parameter means remove one item only
                        }
                        // Save updated JSON data to file
                        const response = await saveJSON(subsDB, allSubscribers);
                        console.log("JSON data saved successfully.");
                    }
                });
            } else {
                console.log("File does not exist or is empty.");
            }
        })
        .catch((error) => {
            console.error("Error loading or saving JSON:", error);
        });
    return res.redirect(`/login`);
});

app.post("/updateStatus", async function (req, res) {
    const { status, userId } = req.body;
    // console.log("status", status, "user", userId);
    const usersJSON = await loadJSON(usersDB);
    // console.log(usersJSON);
    const currentUser = usersJSON.find((user) => user.id == userId);
    if (currentUser) {
        currentUser.status = status;
        const response = await saveJSON(usersDB, usersJSON);
        res.status(200).send("status updated");
    } else {
        res.status(400).send("User doesn't exists");
    }
});

app.post("/newProfilePicture/:id", upload.single("pfPicture"), async function (req, res) {
    try {
        const userId = req.params.id;
        const fileDetails = req.file;
        if (fileDetails.size > 2000) {
            return res.status(400).json({ error: "File size exceeds the allowed limit (2 KB)." });
        }

        const userData = await loadJSON(usersDB);
        const currentUser = userData.find((user) => user.id == userId);
        currentUser.pfPicture = `/uploads/${fileDetails.originalname}`;
        saveJSON(usersDB, userData);
        // res.json({ message: "File uploaded successfully", file: fileDetails });
        // return to account page
        return res.redirect(`/account/${userId}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});


///////////////////////////////
///// extra shit comments /////
///////////////////////////////

// import { json, urlencoded } from "body-parser";
// import { cors } from "@tinyhttp/cors";
// issues with this when writing it with tinyhttp