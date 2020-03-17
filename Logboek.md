# Logboek
## Totaal aantal uren : 22u

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
* 3/2/2020 : 2u
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
		* Willen toch eigen user takken bijhouden met daaronder
	* Converter aanpassen
	* Problemen met geneste data

## Week 5:
*4u les.
	* Onnodige UserId property bij Categories tree
	* Alle properties met een numerieke value als string omgezet naar pure numerieke value
	* Firebase rules
		* Updaten voor nieuwe structuur
		* Mee leren werken
		