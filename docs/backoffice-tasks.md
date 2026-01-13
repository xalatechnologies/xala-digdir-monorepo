## Backoffice – hovedstruktur (Admin + Saksbehandler)

*Applikasjon:* ⁠ backoffice.digilist.no ⁠
*Roller:*

•⁠  ⁠Administrator
•⁠  ⁠Saksbehandler

Samme meny, men med rollebasert tilgang.

---

# 1. Dashboard

*Formål:* Umiddelbar oversikt over status i systemet

*Innhold:*

•⁠  ⁠KPI-kort:

  * Antall aktive lokaler
  * Ventende forespørsler
  * Godkjente bookinger i dag/uke
  * Avviste forespørsler
•⁠  ⁠Hurtiglenker:

  * Nye forespørsler
  * Opprett nytt lokale
  * Kalender (ukevisning)
•⁠  ⁠Varsler:

  * Nye forespørsler
  * Avvik (konflikt, manglende betaling, utløpt godkjenning)

---

# 2. Lokaler / Listings

*Felles modul for alt som kan leies*

## Tabs:

•⁠  ⁠Lokaler (SPACE)
•⁠  ⁠Utstyr (ITEM)
•⁠  ⁠Tjenester (SERVICE)

---

## 2.1 Listevisning (per tab)

*Kolonner:*

•⁠  ⁠Navn
•⁠  ⁠Type
•⁠  ⁠Pris
•⁠  ⁠Status (Draft / Published / Archived)
•⁠  ⁠Sist endret
•⁠  ⁠Ansvarlig saksbehandler
•⁠  ⁠Handlinger

*Filtrering:*

•⁠  ⁠Status
•⁠  ⁠Type
•⁠  ⁠Pris
•⁠  ⁠Tilgjengelighet
•⁠  ⁠Saksbehandler

*Handlinger:*

•⁠  ⁠Rediger
•⁠  ⁠Publiser / Avpubliser
•⁠  ⁠Arkiver
•⁠  ⁠Kopier
•⁠  ⁠Se i frontend

---

## 2.2 Opprett / Rediger listing

*Felles felt (alle typer):*

•⁠  ⁠Tittel
•⁠  ⁠Beskrivelse
•⁠  ⁠Bilder
•⁠  ⁠Pris
•⁠  ⁠Pris-enhet (time, dag, fast)
•⁠  ⁠Vilkår (tekst / vedlegg)
•⁠  ⁠Status
•⁠  ⁠Krever godkjenning (ja/nei)
•⁠  ⁠Aldersbegrensning (under/over 18)
•⁠  ⁠Tilknyttet saksbehandler

*SPACE-spesifikt:*

•⁠  ⁠Kapasitet
•⁠  ⁠Romtype
•⁠  ⁠Areal
•⁠  ⁠Tilgjengelige tider
•⁠  ⁠Sesongstøtte (ja/nei)

*ITEM-spesifikt:*

•⁠  ⁠Antall tilgjengelig
•⁠  ⁠Enhetsbegrensning
•⁠  ⁠Krever depositum (ja/nei)

*SERVICE-spesifikt:*

•⁠  ⁠Varighet
•⁠  ⁠Kan kombineres med booking (ja/nei)

---

# 3. Kalender

*Formål:* Visuell planlegging og konfliktkontroll

*Visninger:*

•⁠  ⁠Dag
•⁠  ⁠Uke
•⁠  ⁠Måned
•⁠  ⁠Ressursvisning (per lokale)

*Funksjoner:*

•⁠  ⁠Dra-og-slipp bookinger
•⁠  ⁠Sperr tid
•⁠  ⁠Opprett manuell booking
•⁠  ⁠Se forespørsler i kontekst

---

# 4. Forespørsler

*Innboks for saksbehandler*

*Liste:*

•⁠  ⁠Forespørsels-ID
•⁠  ⁠Bruker / organisasjon
•⁠  ⁠Lokale / ressurs
•⁠  ⁠Tidsrom
•⁠  ⁠Status
•⁠  ⁠Opprettet dato

*Handlinger:*

•⁠  ⁠Åpne forespørsel
•⁠  ⁠Godkjenn
•⁠  ⁠Avslå
•⁠  ⁠Be om mer info
•⁠  ⁠Konverter til booking

---

## 4.1 Forespørselsdetalj

*Viser:*

•⁠  ⁠Søkerinformasjon
•⁠  ⁠Valgt lokale / utstyr / tjenester
•⁠  ⁠Prisoppsummering
•⁠  ⁠Historikk
•⁠  ⁠Meldinger

*Handlinger:*

•⁠  ⁠Godkjenn → opprett booking
•⁠  ⁠Avslå med begrunnelse
•⁠  ⁠Send melding til søker

---

# 5. Bookinger

*Oversikt over alle bekreftede bookinger*

*Liste:*

•⁠  ⁠Booking-ID
•⁠  ⁠Bruker / organisasjon
•⁠  ⁠Ressurs
•⁠  ⁠Tidsrom
•⁠  ⁠Status
•⁠  ⁠Betalingsstatus

*Handlinger:*

•⁠  ⁠Endre
•⁠  ⁠Avbryt
•⁠  ⁠Se fakturagrunnlag
•⁠  ⁠Se tilgang (låssystem)

---

# 6. Sesongleie

*Kun admin + saksbehandler*

*Funksjon:*

•⁠  ⁠Opprette faste perioder
•⁠  ⁠Tilknytte organisasjoner
•⁠  ⁠Blokkere kalender
•⁠  ⁠Overstyre enkeltbookinger

*Felter:*

•⁠  ⁠Lokale
•⁠  ⁠Periode
•⁠  ⁠Ukedager
•⁠  ⁠Tidsrom
•⁠  ⁠Organisasjon
•⁠  ⁠Prisregime

---

# 7. Meldinger

*Intern + ekstern kommunikasjon*

*Visninger:*

•⁠  ⁠Samtaler per booking
•⁠  ⁠Systemmeldinger
•⁠  ⁠Historikk

*Funksjoner:*

•⁠  ⁠Saksbehandler ↔️ bruker
•⁠  ⁠Varsler ved statusendring
•⁠  ⁠Loggføres på booking

---

# 8. Organisasjoner

*Admin-modul*

*Liste:*

•⁠  ⁠Navn
•⁠  ⁠Org.nr
•⁠  ⁠Antall brukere
•⁠  ⁠Aktive bookinger

*Detalj:*

•⁠  ⁠Medlemmer
•⁠  ⁠Roller
•⁠  ⁠Tilknyttede bookinger
•⁠  ⁠Sesongavtaler

---

# 9. Brukere

*Admin-modul*

*Liste:*

•⁠  ⁠Navn
•⁠  ⁠Rolle
•⁠  ⁠E-post
•⁠  ⁠Siste innlogging

*Handlinger:*

•⁠  ⁠Opprett
•⁠  ⁠Deaktiver
•⁠  ⁠Tildel roller
•⁠  ⁠Tilknytt organisasjon

---

# 10. Rapporter

*Formål:* Innsikt og dokumentasjon

*Rapporter:*

•⁠  ⁠Bruk per lokale
•⁠  ⁠Inntekt per periode
•⁠  ⁠Avviste forespørsler
•⁠  ⁠Aktivitet per organisasjon

*Eksport:*

•⁠  ⁠PDF
•⁠  ⁠Excel

---

# 11. Innstillinger

*Systemnivå*

•⁠  ⁠Betaling (faktura, Vipps, kort)
•⁠  ⁠Låssystem-integrasjon
•⁠  ⁠Arkiv / sakssystem
•⁠  ⁠Roller og rettigheter
•⁠  ⁠Demo-innstillinger