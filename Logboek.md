# Logboek
## Totaal aantal uren : 58u 45m

## Week 1:
* 4u les.
    * Codelab van chat met firebase.
	* Leren navigeren in firebase tool.
	* Nagedacht over het omzetten van huide MySQL db naar een firebase No-Sql db.

## Week 2:
* 4u les.
	* 2 firebase projecten geopened
		* 1 development project waar ik alleen kan in testen.
		* 1 production project waar zowel Mathias en ik toegang tot hebben.
	* Verder uitwerken JSON structuur voor omzetting van MySQL naar firebase.
	* Opzoekingen gedaan naar mogelijke bestaande converters (Geen bruikbare resulaten).
	* Uiteindelijk zelf gestart met een converter te maken in JS.

## Krokusvakantie:
* 3/02/2020 : 2u
	* Verder gewerkt aan JS converter.
		* Van mapping function overgestapt naar gewoone forloop die per origineel object een aangepast object maakt.
		* Geslaagde test bij users column.
	* De converter is erg basic, geen output/input files. Input data is hardcoded, en de output wordt op een lege HTML pagina getoond.
	* Converted output is nagekeken geweest met een JSON formatter (zie bronnen), deze geeft aan dat de conversie valide is.
	* Deployment naar firebase development project om uit te testen
		* First impressions zijn goed, structuur is geaccepteerd en niet veranderd.
		* Uitzoeken hoe we huidige data best integreren met get systeem
			* Oude users moeten bruikbaar blijven, maar de nieuwe authenticatie moet geimplementeerd worden.
			* mogelijke problemen met het auto-ID systeem van firebase

## Week 3:
* 4u les.
	* Firebase Codelab voor Android
		* Gradle problemen oplossen...
		* Voltooien van codelab
	* Missende key/value pairs in database
		* Nieuwere bronddata gebruikt
		* converter aangepast

## Week 4:
* 4u les.
	* Firebase rules uitwerken
	* Opnieuw nieuwe datastructuur uitgewerkt
		* Willen toch eigen user takken bijhouden met daaronder informatie voor die user
	* Converter aanpassen
	* Problemen met geneste data

## Week 5:
* 4u les.
	* Onnodige UserId property bij Categories tree
	* Alle properties met een numerieke value als string omgezet naar pure numerieke value
	* Firebase rules
		* Updaten voor nieuwe structuur
		* Mee leren werken

## Week 6:
* 4u les.
	* Leren werken met cloud functions
		* Maken van een testopstelling
		* Uitproberen van ingebouwde cronjob/google scheduler (Heeft billing information nodig, dit zal dus een no-go zijn)
		* Uitproberen van oude manier van werken (Via cron-job.org de url van de functie aanroepen, dit werkt)
	* Start van CreateDailyAssessment function
		* Vervangen van de testopstelling met de CreateDailyAssessment function
		* Cronjob op cron-job.org tijdelijk uitschakelen.

* 30/03/2020 : 1u.
	* Afwerken van de CreateDailyAssessments
		* Cronjob op cron-job.org opnieuw inschakelen
	* Aantal dagen laten testen op eigen development project, daarna op production zetten.

## Paasvakantie
* 16/04/2020 : 4u
	* Beveiligen van cron-job
		* Uitzoeken hoe basic auth werkt
		* HTTPS endpoint function in firebase aanpassen om met basic auth te werken
	* cloud functions
		* cloud functions met een trigger op het aanmaken/aanpassen van een task of assessment
		* Functies die automatisch de status van deze gaat aanpassen

## Week 7:
* 4u les.
	* Verder aanvullen van de automatische status functions
	* Logging toevoegen

## Week 8:
* 4u les.
	* Verder beveiligen van cron job
		* x-forwarded-for header gebruiken om source IP na te gaan met een whitelist
		* Logging toevoegen voor unauthorized access
	* Afdwingen van POST requests

## Week 9:
* 5/05/2020 : 1u
	* Alle security van test functie overgezet naar CreateDailyAssessments functions
	* Environment variables toegevoegd voor basic auth cron job

* 4u les + 30m.
	* Oplossing zoeken voor mail notificaties unauthorized calls
		* Oplossing gekozen voor nodemailer
	* Uitschrijven van de oplossing
		* debuggen van project problemen met nodemailer (module werd nooit gevonden tijdens deployment)
		* Blijkbaar was originele projec structuur door elkaar gehaald
			* project verwijderd & opniew geinitialiseerd

* 7/05/2020 : 45m
	* A.d.h.v. log errors merkte ik dat de cronjob incorrect uitvoerde
	* Minor refactoring & semantic changes
	* I.p.v. het Source IP address van een request direct uit de header 'x-forwarded-for' te halen maak ik nu gebruik van een ingebouwd firebase functie;
		* In het geval er met proxies gewerkt wordt ging de oude manier een string van meerdere IP's teruggeven
		* Nieuwe manier geeft altijd originele client IP address terug.

## Week 10:
* 4u les:
	* Toevoegen van extra statussen wanneer task enddate wordt aangepast
		* Invalideren bestaande assessments indien deze aangemaakt zijn na nieuwe enddate
		* Valideren indien deze invalide waren & voor de nieuwe einddatum zijn aangemaakt
	* Functions verbinden met productie project
		* pushen naar production project
		* Nieuwe cron-job op cron-job.org voor production project aangemaakt

* 12/05/2020 : 4u
	* Refactoren van cloud functions
		* .then() promises vervangen met ingebouwde callbacks bij het maken van een reference.
			* Algemene structuur aangepast van functions hierdoor (waar/wanneer komt de return)
		* Overbodige if then structuren vervangen met ternaire operators
		* Voor semantiek let vervangen door const waar mogelijk
		* Probleem met Date comparison opgelost
			* Ik vergelijk de datums uit een databank door deze te parsen in een Date object
			* Soms moest ik date comparison doen t.o.v. de datum van uitvoering van de function
				* Deze verkreeg ik door een new Date() object aan te maken
				* Deze geeft ook de tijd mee, waardoor een date comparison moeilijk wordt
				* Nu heb ik een algemene methode die uit een Date object, een datum als string haalt & deze door een Date object parsed, zodat er enkel met datum vergeleken wordt & niet met tijd
		* Testen na refactoring & aanpassingen
		* Deploy to production

## Week voor het examen
* 15/06/2020: 5u
	* Vinden van een goede representatie van een NoSQL DB.
		* Gebruik van Hackolade community software om een model van de DB te bouwen
		* Genereren van documentatie

* 16/06/2020: 4u 30m
	* Aanpassen van de gegenereerde documentatie om enkel nuttige informatie over te houden (Gegenereerde documentatie was PDF formaat. Heeft redelijk tijd gekost om dit in word verder aan te passen...)
	* Start aan de rest van documentatie aan firebase kant van het project.
	* Github up-to-date brengen
