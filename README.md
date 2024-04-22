# API cmd minor

## Description

I wanted to make a chat app like WhatsApp or another app with a chat feature. 

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

4. Make an `.env` file and fill in these variables:
   
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
      publicKey: // HERE //,
      privateKey: process.env.PRIVATE_VAPID_KEY,
   };
   ```

5. Start the application:

   ```
   npm run dev
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

## API's

- Idle detection
- Notification api (great tutorial and information about it: [web-push-book](https://web-push-book.gauntface.com/))

## Wishlist

- [ ] Add custom profile picture 
- [ ] A bit better styling
- [ ] gsap animation when you send or receive a message 
- [ ] add passwords to accounts
- [ ] offline available
- [ ] send the offline send message as soon as someone is back online
- [ ] Use a builder
- [ ] Make chat groups 

## License

My website is open-source and released under the [MIT License](LICENSE).