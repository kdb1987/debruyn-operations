# DeBruyn Operations

Internes Organisationswerkzeug für De Bruyn Physiotherapie.

## Enthalten

- passwortgeschützter Zugang
- BGM-Kalkulation mit individuellen Personalstunden
- Fahrtzeit, Kilometer und sonstige Kosten
- interne Kostenaufschlüsselung
- externe Angebotsansicht mit Kopierfunktion
- responsive Darstellung für Desktop und Mobilgeräte

## Kalkulationsregeln

- Personal und Fahrtzeit: 90 Euro pro Stunde
- Kilometer: 0,60 Euro pro Kilometer
- Gewinnaufschlag: 25 Prozent
- Endpreis: Aufrundung auf die nächsten 5 Euro
- kein Ausweis von Mehrwertsteuer

## Lokaler Start

1. `.env.example` nach `.env.local` kopieren und Werte setzen.
2. `pnpm install`
3. `pnpm dev`

## Benötigte Umgebungsvariablen

- `OPERATIONS_PASSWORD`
- `OPERATIONS_SESSION_TOKEN`
