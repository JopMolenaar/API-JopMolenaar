## api

### Week 1

Deze week begonnen we met het vak API. Het doel van het vak was om meer te leren  over de mogelijkheden die er zijn op het web. Na een introductie mochten we kiezen wat voor applicatie we wilde maken en na wat twijfelen koos ik om een chat applicatie te maken.
Ik twijfelde een beetje om een chat applicatie te maken omdat ik het al een keer eerder had geprobeerd en er toen niet uitkwam, maar na wat research en nadat Declan ‘server send request’ had genoemd wist ik het zeker. Mij leek dit echt super cool en leuk om te doen. 
Ik had al meteen ideeën om mijn applicatie beter te maken met de … api en de … api. Met de … api kan je namelijk je website op je begin scherm van je mobiel zetten zonder dat de browser balk erboven komt. Hierdoor voelt het dan echt aan als een app. Ik had dit al eerder gezien maar wist nooit hoe mensen dat deden. En met de … api wil ik push notificaties kunnen sturen als je een appje binnen krijgt. Dit leek mij wel passend bij een chat app en leuk om in te duiken. 

Die dinsdag ging ik aan de slag met het opzetten van mijn chat app. Dit ging best heel soepel en kreeg die zelfde dag de chat aan de praat.  Dit deed ik door middel van ‘server send events’. Ik heb hiervoor gekozen omdat het makkelijke code is, makkelijk te begrijpen is en je niks hoeft te downloaden kwa websockets en socket.io. 

Vrijdag had ik het feedback gesprek bent Declan. Hij zei dat ik erg goed op weg was, dat ik in de juiste volgorde aan het coderen was (logica eerst, daarna design), en vertelde mij dat ik gewoon de data mag opslaan op de server ipv mongoDB proberen op te zetten. Dit valt namelijk buiten de opdracht en is zonde van m’n tijd. 
Die zaterdag heb ik een hoop logica geschreven zoals het maken van accounts, contacten toevoegen, chats aanmaken etc. 

### Week 2

Veel logica nog proberen te schrijven met het elke keer fetchen van je contacten en als er een contact extra is, die toevoegen aan je contacten lijst met js. Dit klonk makkelijk in mijn hooft maar had er een voor gezeten en het lukte niet helemaal perfect. Uiteindelijk heb ik deze functionaliteit uitgesteld. 

Ik ben deze week bezig geweest met service workers, ik wilde het kunnen downloaden op mn mobiel en door een servcie worker, een manifest en een goegekeurde lighthouse check is het een pwa. Nu kon ik het downloaden op mn mobiel. Dit was veel makkelijker dan gedacht.
Ook ben ik bezig geweest met push notifications, ik had het artikel gelezen dat declan mij had gestuurd en het zag er best overzichtelijk en te bergijpen uit. Ik probeerde dit toe te passen op mn website en kreeg een aantal errors, na wat trial and error, kijken op de github van de demo, en het lezen van het artikel kon ik push notifactions sturen. Dit ging dan wel naar iedereen die een account had op mijn website dat is natuurlijk niet de bedoeling. Ik schreef wat logica en het lukte mij om alleen de receiver van de message de popup te krijgen laten zien. Voor localhost werkt dit op chrome naar chrome, mobiel naar firefox, en chrome naar firefox. De rest van de opties laat het niks zien. Terwijl al mijn settings voor de browsers en system settings goed staan.  

Feedback:
Styling (mag best styling van een bestaande app), animaties (zijn een leuke toevoeging), naar declan voor de push noti's, denk aan ux (contact toevoegen maakt ook meteen een chat aan (net als snapchat)), voor een bundler kijk naar bun of een andere. 

### Week 3
Deze week ben ik druk bezig geweest met het beetje stylen van de webpagina, ik vindt het nog steeds erg moeilijk om zomaar even css te schrijven zonder er een design naast mij ligt en ik ben ook niet zo van het eerst desginen van mijn website. Ik ondervond problemen met de styling op mobiel, dit leek erg te verschillen met wat ik op mijn macbook had gemaakt. Dit kwam uiteindelijk doordat deze regel miste in de head van mijn pagina: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. 

Na een beetje styling te hebben toegevoegd, notifications werkend te hebben gekregen, had ik nog een aantal dingen op mijn lijstje die ik nog graag wilde doen. Dat waren:

- [x] Als je op mobiel de tekst balk focused, het scherm dan niet moet inzoomen en de header in beeld moet blijven staan.
- [x] Contacten en chats tegelijk toevoegen en makkelijker maken, ook fetchen bij de ander
- [x] online of offline status fetchen van je contact.

- [ ] Data in json zetten zodat ie het behoud.
- [ ] Alleen noti's sturen als je offline bent. 

- [ ] normale pf picture 
- [ ] Iets betere styling (status, login)
- [ ] gsap animaion als je een bericht stuurt of als je bepaalde emoji's stuurt

- [ ] password toevoegen
- [ ] offline beschikbaar
<!-- Add contact button styling -->

<!-- // gedaan: local storage dat je in bent gelogd, logd je meteen bij het opstarten van de app weer in.
// gedaan: Als iemand uitlogd, local storage removen en sub verwijderen -->