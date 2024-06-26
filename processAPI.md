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

Ik ben deze week bezig geweest met service workers, ik wilde het kunnen downloaden op m'n mobiel en door een servcie worker, een manifest en een goegekeurde lighthouse check is het een PWA. Nu kon ik het downloaden op m'n mobiel en dit was uiteindelijk veel makkelijker dan gedacht.
Ook ben ik bezig geweest met push notifications, ik had het artikel gelezen dat Declan mij had gestuurd en het zag er best overzichtelijk en te bergijpen uit. Ik probeerde dit toe te passen op m'n website en kreeg een aantal errors, na wat trial and error, kijken op de github van de demo, en het lezen van het artikel kon ik push notifactions sturen. Dit ging dan wel naar iedereen die een account had op mijn website en dat is natuurlijk niet de bedoeling. Ik schreef wat logica en het lukte mij om alleen de receiver van de message de popup te laten zien. Voor localhost werkt dit op Chrome naar Chrome, mobiel naar Firefox, en Chrome naar Cirefox. De rest van de opties laat het niks zien. Terwijl al mijn settings voor de browsers en system settings goed staan.  

Die vrijdag had ik feedback gesprekken. Daar kwam uit dat ik de styling nog moest doen (mag best styling van een bestaande app) en animaties zijn een leuke toevoegin. 
Ik had ook een vraag over de push notifications maar daarvoor moest ik naar Declan. En ik had vragen voor een bundler en daarvoor moest ik kijken naar bun. 
Na het feedback gesprek van Cyd ben ik naar Declan geweest voor mijn vraag over push notificaties, hij zei dat ik de subscriptions moest opslaan in een json bestand ipv op de server. Dit zou mogelijk mijn probleem oplossen. 

Ik heb het dezelfde middag voor melkaar gekregen om de subscriptions op push notifications in een json file op te slaan met `fs`. En ook heb ik mijn UX flow anderes gebouwd zodat het vragen van toestemming voor notifactions achter een melding zit van mijn website die vraagt of je meldingen wilt inschakelen. Dit zorgde ervoor dat de notifations op Chrome en Firefox het goed deden, en ik eindelijk ook een melding kreeg van safari op mobiel om toestemming te kunnen geven voor meldingen van mijn website. Dit komt waarschijnlijk doordat Safari of Apple het meteen vragen van notificaties onderdrukt. 

### Week 3

Deze week ben ik druk bezig geweest met het beetje stylen van de webpagina, ik vindt het nog steeds erg moeilijk om zomaar even css te schrijven zonder er een design naast mij ligt en ik ben ook niet zo van het eerst desginen van mijn website. Ik ondervond problemen met de styling op mobiel, dit leek erg te verschillen met wat ik op mijn macbook had gemaakt. Dit kwam uiteindelijk doordat deze regel miste in de head van mijn pagina: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. 

Na een beetje styling te hebben toegevoegd, notifications werkend te hebben gekregen, een idle detection te hebben toegevoegd om de status van de contacten te laten zien, en je account te onthouden en dus automatisch in te loggen met localstorage, had ik nog een aantal dingen op mijn lijstje die ik nog graag wilde doen. En uit het feedback gesprek op vrijdag kwam voornamelijk dat ik prioriteiten moest stellen met wat ik nog ga doen, en dat moest kiezen wat mijn aplicatie ten goede zou komen. Dit was vooral:

- De flow iets verbeteren met contacten toevoegen
- De data niet meer opslaan op de server maar in json bestanden
- Bepaalde data (Offline, Online status van je contacten en of je nieuwe contacten hebt) fetchen op de achtergrond
- Kleine styling dingen. 

Dit allemaal zonder de styling dingentjes heb ik allemaal die vrijdag middag verwerkt. Ik had vorige week moeite met het fetchen van de contactenlijst want in mijn vorige concept had ik dat je contacten kon toevoegen en dat je niet meteen een chat met elkaar kreeg. De manier hoe ik het deed was ook niet logisch en uiteinelijk had ik het uitgesteld naar een later moment. Deze vrijdag begon ik weer vanaf het begin met het schrijven van de feature, en binnen een korte tijd werkte het goed. 

### Week 4

Deze week ben ik bezig geweest met het opruimen en zorgvuldig testen van mijn code. Ik heb die maandag geprobeerd om met multer files te kunnen uploaden zodat gebruikers hun eigen profiel foto kunne uitkiezen. Aangezien ik de plaatjes opsla op de server, moet de server restarten om zo de changes te kunnen zien, ook kwam ik erachter dat de json files waartoe ik data schrijf leeg worden gemaakt door render. Dit zorgt ervoor dat de berichten en aangemaakte accounts weg zijn als de server wordt herstart. Dit is natuurlijk niet handig bij een chatapp.
Aangezien het opzetten van een database niet echt in de opdracht viel en experimenteren wel, was ik aan het brainstormen over nieuwe oplossingen. Waar ik eigenlijk meteen aan dacht is dat de files op een aparte omgeving moesten staan. Met dat in gedachte maakte ik een private github repo, genereerde ik een key om zo de data uit de repository te kunnen halen, en er data naar toe te kunnen schrijven. Ik wist niet dat dit kon en vond het wel grappig om te maken. Ik kwam uiteindelijk wel tegen wat dingen aan en dit was dat de data soms nog niet was geupdate wanneer het al werd opgehaald. Dit gaf bijvoorbeeld een "page not found" wanneer je net een account hebt aangemaakt. Om dit op te lossen moest ik een aantal `await`'s voor de saveJSON functie zetten, en dit loste het op. Wel werd de applicatie er heel erg traag van omdat hij elke keer weer data moest mergen met wat er op github stond. Uiteindelijk heb ik het iets sneller kunnen maken dan dat het was door wat awaits op niet nodige plekken weg te halen zoals het sturen van berichten. 
En als de app groter zou worden zou het een probleem zijn dat je steeds moet mergen met dezelfde file, dit zou gegarandeerd fout gaan. Als oplossing daarvoor zou je dan dynamisch files moeten aanmaken met een beetje data erin waar niet iedereen hun data instopt. 

Uiteindelijk ben ik er dus achtergekomen dat je data kan ophalen en schrijven naar een private github repo en die als mini database kan gebruiken. Efficient, schaalbaar, snel en betrouwbaar is het niet, maar ik vond het een leuk experiment. 