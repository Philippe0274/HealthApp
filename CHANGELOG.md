# Changelog

## 2.0.3 - 2026-07-02

- Headerlayout op telefoon hersteld naar compact 3-koloms raster.
- Headerknoppen gebruiken expliciet `window.app` waar nodig.
- Iconen in headerknoppen krijgen geen eigen pointer events meer, zodat taps op de knop landen.
- `APP_VERSION` en service-worker fallback verhoogd naar 2.0.3.

## 2.0.1 - 2026-07-02

- PWA-updateflow hersteld zodat nieuwe GitHub-versies automatisch op smartphones actief worden.
- Service worker toegevoegd met versiegestuurde cache names op basis van `APP_VERSION`.
- Nieuwe service worker gebruikt `skipWaiting()` en `clients.claim()` voor directe activatie.
- Oude Health Tracker caches worden tijdens `activate` automatisch verwijderd.
- App registreert de service worker met `updateViaCache: 'none'` en `/sw.js?v=APP_VERSION`.
- Kleine update-melding toegevoegd: "Nieuwe versie beschikbaar."
- Geen wijzigingen aan localStorage, patiëntgegevens, metingen, medicatie, rapporten, Google Drive, Telegram, backup of restore.

## 2.0.0 - 2026-07-02

- Verhoogd naar `APP_VERSION` 2.0.0.
- Patiënttaal vastgelegd als centrale taalbron voor de applicatie.
- Eén vaste noodcontactfiche toegevoegd binnen de bestaande patiëntgegevens.
- Noodcontact bewaart naam, relatie, e-mailadres, telefoonnummer en taal.
- Architectuur voorbereid zodat toekomstige alarmrapporten de taal van het noodcontact kunnen gebruiken.
- Lokale JSON-restore herstelt patiëntgegevens opnieuw, inclusief noodcontact.
- Geen functionele alarmen, e-mailverzending of wijzigingen aan metingen, medicatie, Telegram of Google Drive-logica toegevoegd.
