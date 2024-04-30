# API cmd minor

## Description

In this project which involved using APIs, and discovering features of the web you didn't know before, I made a chat app like WhatsApp and other messaging apps. I build the application with node.js, Javascript, Liquid and css. I used server send events to let the receiver get the texts, idle detection to know if the user is active or not and I worked with service workers to be able to install the PWA and to use the push notifications api to send notifications to the user if he is not online. I tried some experimental things during this project and one of them is that I did not set up a database. I stored the messages on the server in the beginning. After a while I used `fs` to store them in a json file instead of the server. But render, the service where I have put my webapp online, resets the content of these files when the server restarts. And because I didn't wanted to set up a database, I thought of something different. I made a private github repository, generated an access token, and now I store and get the data from my own github api/database. 

## Process

[Link to process (Dutch) ](https://processjournal-jopmolenaar.onrender.com/processAPI)

## Table of contents

- Installation
- Use of features
- API's
- Wishlist
- License

## Installation

1. Clone the repository:

    ```
    $ git clone https://github.com/JopMolenaar/API-JopMolenaar.git
    ```
2. Navigate to the project directory:

   ```
   $ cd myApp
   ```

3. Install the dependencies:

   ```
   $ npm install
   ```

4. In order to send push notifications you need to make an `.env` file and fill in these variables:
   
   - PRIVATE_VAPID_KEY
   - MAIL

   For the vapid key's that you need for the push notifications, type this command in the terminal
   ```
   $ npm install -g web-push
   $ web-push generate-vapid-keys
   ```
   This will create a public and a private key. Put the private key in the env variable and place the public one here:

   ```js
   const vapidKeys = {
      publicKey: // HERE,
      privateKey: process.env.PRIVATE_VAPID_KEY,
   };
   ```

5. For experimental purposes I did not setup a database and writing to local json files with `fs` was getting emptied when restarting the server on render, so I made my own github repo api/database. To set this up for your own you need to:
   - Make a private github repository.
   - Generate a Personal access token (classic) under /settings -> /Developer settings. 
   - Once you have that token, place this in the ACCESSTOKEN variable, and place the your account name / your repo name in the REPONAME variable in the `.env`. 
   - Adjust the `usersDB`, `chatsDB`, `subsDB` and `messagesDB` variables in the server.js if needed, to the correct routes you have setup in your repo. 

6. Start the application:

   ```
   $ npm run dev
   ```

   The application will be accessible at `http://localhost:4000`.

## Use of features

- [x] Be able to chat to people 
- [x] making accounts
- [x] adding contacts with chats
- [x] Store data in a json file instead of the server
- [x] Fetch data on the background and update when needed (contact list and contact status)
- [x] The chat works without js, js is only for a better UX and fetching data on the background
- [x] Error messages popups are displayed with a error message when there is an error.
- [x] Automatic scrolling when you send or get a message. 
- [x] Remember the user (localstorage)
- [x] Know when the user is online/offline or inactive and update the status of that user
- [x] Send push notifications to people that have a subscription when they are offline
- [x] Remove the subscription when someone logs out of their account. 
- [x] Add custom profile picture 

## API's

- Idle detection
- Notification api (great tutorial and information about it: [web-push-book](https://web-push-book.gauntface.com/))
- Github api (See installation on how to setup)

## Wishlist

- [ ] Use a database instead of a github repo to store data
- [ ] A bit better styling
- [ ] gsap animation when you send or receive a message 
- [ ] add passwords to accounts
- [ ] offline available
- [ ] send the offline send message as soon as someone is back online
- [ ] Use a builder
- [ ] Make chat groups 

## License

My website is open-source and released under the [MIT License](LICENSE).