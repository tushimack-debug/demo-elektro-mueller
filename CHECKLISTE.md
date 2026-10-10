# Priorisierte Checkliste

## 1. Sofort ohne Kundendaten

### P1 Sicherheit und Datenschutz
- [x] Bekannte Secret-Muster im getrackten Stand automatisiert prüfen; `.env` und private Schlüssel ignorieren. Kein vollständiger Beweis der Secret-Freiheit.
- [x] CSP, Referrer-Policy und Header-Vorlage ergänzen; tatsächliche Host-Unterstützung als offen dokumentieren.
- [x] Kein Maps-Frame vor Einwilligung; erklärter Button und Entfernen/Widerruf ohne Speicherung.
- [x] Lokale Fonts beibehalten; keine Font-CDNs, Analytics oder externen 3D-CDNs ergänzen.
- [x] Neue Tabs mit `noopener noreferrer` absichern und statisch prüfen; derzeit keine externen `_blank`-Links vorhanden.
- [x] Basisbedienung von optionaler 3D-Szene trennen.

### P1 Wartung und Recovery
- [x] Three.js aktualisieren, Lockfile, Vendor-Generator und Dependabot ergänzen.
- [x] Sicherheits-, Browser- und Accessibility-Checks in CI vorbereiten.
- [x] Backup-, Wiederherstellungs- und Vorfallablauf dokumentieren.
- [ ] GitHub/Hosting/Domain: 2FA, einzigartige Passwörter, Recovery-Codes und minimale Zugriffsrechte **in den Kontoeinstellungen prüfen**. Vom Code aus nicht bestätigt.
- [ ] Separates verschlüsseltes Backup tatsächlich erstellen und Wiederherstellung üben; Anleitung ersetzt kein Backup.

### P2 Bedienung, SEO und Leistung
- [x] Mobile Breiten, Tastaturmenü/Escape, Skiplink, Fokus und Kontrast prüfen.
- [x] Formulare begrenzen/validieren; E-Mail-Entwurf ausdrücklich als noch nicht versendet kennzeichnen.
- [x] Optionale 3D-Szene, reduced-motion, 30-fps-Limit, Hintergrundpause, mobiles Budget und Freigabe ergänzen.
- [x] Demo-Titel/Beschreibung, Sprache, Überschriften und noindex/nofollow ergänzen; keine erfundenen SEO-Geschäftsdaten.
- [x] Unbelegte Festzulassungs-Aussage entfernen und Bestandsdaten als ungeprüft markieren.

## 2. Nach Kundenkontakt / vor Veröffentlichung oder Verkauf

### P1 Freigabe
- [ ] Firmenname, Rechtsform, Anschrift, Kontakte, Leistungen, Öffnungszeiten und Qualifikationen vom Betrieb bestätigen lassen.
- [ ] Impressum, Datenschutz und Demo-Betreiberangaben konkret vervollständigen; Hoster/Logs und Dienste prüfen.
- [ ] Nutzungsrechte und vollständige Lizenzen für Fonts, Bilder, Texte und Marken dokumentieren.
- [ ] Vertrag: Leistungsumfang, Abnahme, Wartung, Haftung, Zuständigkeiten und Zugangseigentum klären; keine ungeprüfte Haftungsklausel übernehmen.
- [ ] Domain/Hosting/HTTPS und unterstützte Header auf der tatsächlichen Domain testen; Zugangsschutz für Vorschauen klären.
- [ ] Kundenzugänge, Recovery-Codes, Backup, Wiederherstellung und Übergabe vereinbaren.

### P2 Betrieb und Kundennutzen
- [ ] Canonical, Sitemap und echte lokale SEO-Daten ergänzen; noindex/robots erst nach Freigabe ändern.
- [ ] Bei echtem Formularversand Dienst, Spam-Schutz, Datenminimierung, Aufbewahrung und Datenschutzhinweise festlegen.
- [ ] Analytics oder weitere externe Dienste nur nach konkreter Bedarfsklärung und Datenschutzprüfung einrichten.
- [ ] Auf echten Mobilgeräten und Browsern prüfen; echte Ladezeitmessungen auf Zielhosting durchführen.
