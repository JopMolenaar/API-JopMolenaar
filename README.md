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

<!-- - [x] Als je op mobiel de tekst balk focused, het scherm dan niet moet inzoomen en de header in beeld moet blijven staan.
- [x] Contacten en chats tegelijk toevoegen en makkelijker maken, ook fetchen bij de ander
- [x] online of offline status fetchen van je contact.
- [x] Data opslaan in json bestanden

- [x] Be able to chat to people 
- [x] making accounts en opslaan op de server
- [x] adding contacts en opslaan op de server
- [x] messages opslaan op de server -->
<!-- - [x] maak de id als je een account aanmaakt een random nummer van 7 cijfers. Dan zijn de id’s in de url iets veiliger. -->
<!-- - [x] error messages
- [x] Some checks on the server like: checking if the generated id is really unique
- [x] sending chats works without js and js is only for optimization
- [x] adding a contact using js without refreshing the page
- [x] fetch the data on the server to see if you have a new contact and if a chat exists
- [x] Online status next to the name of the contact in the chat
- [ ] Automatic scrolling when you send or get a message. -->

<!-- // gedaan: local storage dat je in bent gelogd, logd je meteen bij het ops
tarten van de app weer in.
// gedaan: Als iemand uitlogd, local storage removen en sub verwijderen -->

## API's

<!-- - [ ] using the api that allows it to place the webapp on your mobile front screen without a browser bar and with a logo as logo. 
- [ ] getting notifications (api) -->


## Wishlist

<!-- - [ ] Alleen noti's sturen als je offline bent. 
- [ ] normale pf picture 
- [ ] Iets betere styling (status, login)
- [ ] gsap animaion als je een bericht stuurt of als je bepaalde emoji's stuurt
- [ ] password toevoegen
- [ ] offline beschikbaar 
- [ ] learn more about builders, use one and upgrade the performance.
- [ ] Make chat groups 
- [ ] Have a nice styling  -->

## License

My website is open-source and released under the [MIT License](LICENSE).