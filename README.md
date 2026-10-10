# Elektro-Müller-Website-Demo

Unbeauftragter, ungeprüfter Entwurf. Keine offizielle Betriebswebsite. Bestehende Namen, Anschrift, Telefon, Fax und E-Mail wurden aus der Ausgangsversion übernommen und in dieser Überarbeitung nicht als aktuell bestätigt. Leistungen und Formulierungen sind Beispiele. Keine neuen Geschäftsangaben, Öffnungszeiten, Bewertungen oder strukturierten Geschäftsdaten wurden ergänzt.

## Lokal prüfen

Node.js 24 und pnpm 11.25.0 verwenden:

```sh
pnpm install --frozen-lockfile
pnpm sync-vendor
pnpm test
pnpm audit --audit-level=high
pnpm exec playwright install chromium
pnpm test:browser
pnpm serve
```

Vorschau: http://127.0.0.1:4173. Der Vorschau-Server bindet nur an localhost. `test-results/` enthält Screenshots und wird nicht eingecheckt. CI installiert zusätzlich Linux-Browserabhängigkeiten. Nicht `node_modules`, `.git`, Tests oder Entwicklungsskripte veröffentlichen.

## Technische Defaults

- Keine Analyse-Dienste, eigenen Cookies, lokalen Speicherung oder Formular-API. Schriftdateien und Three.js liegen lokal.
- Navigation, Kontakt und Maps funktionieren unabhängig vom Laden der 3D-Module. Ohne JavaScript bleiben Inhalte und Kontaktlinks verfügbar.
- Kontakt erzeugt nur einen E-Mail-Entwurf; der Nutzer muss im E-Mail-Programm senden. Formularinhalte werden nicht an einen Website-Server geschickt. Bestehender Empfänger ist ungeprüft.
- Google Maps startet ausschließlich nach erklärter Einwilligung. Entfernen beendet die Einbettung; bereits übertragene Daten und Google-Cookies können damit nicht gelöscht werden. Keine Einwilligung wird gespeichert.
- Three.js lädt erst beim Einschalten. Reduzierte Bewegung verhindert den Start und pausiert eine laufende Szene. Es gibt einen Ausschalter, 30-fps-Limit, niedrigere mobile Geometrie/Pixelzahl, kein mobiles Bloom, Pausieren im Hintergrund und Ressourcenfreigabe beim Ausschalten/Verlassen.
- Meta-CSP begrenzt Skripte/Fonts auf eigene Dateien, Netzwerkzugriffe des eigenen Codes auf `none`, Frames auf `maps.google.com`. Importmap ist per Hash freigegeben. Inline-Skripte sind sonst gesperrt. Bei Änderung der Importmap müssen Meta-CSP und `_headers` zusammen aktualisiert werden. LF-Zeilenenden sind festgelegt.
- `noindex, nofollow` und `robots.txt` schützen nicht vor öffentlichem Zugriff. Für vertrauliche Vorschauen Hosting-Zugriffsschutz verwenden. Canonical, Sitemap und LocalBusiness-Markup erst mit bestätigter Domain und Unternehmensdaten hinzufügen.

## Veröffentlichung und Grenzen

Für einen statischen Host nur HTML, `app.js`, `scene.js`, `styles.css`, `fonts/`, `vendor/`, `robots.txt` und die unterstützte Header-Konfiguration ausliefern. HTTPS einschalten und Zertifikat prüfen. `_headers` ist eine Vorlage für Hosts, die dieses Format unterstützen; GitHub Pages setzt diese Datei **nicht** als HTTP-Header um. Meta-CSP und Referrer-Meta gelten auch dort, `frame-ancestors`, `X-Frame-Options`, `nosniff` und Permissions-Policy benötigen eine passende Host-Konfiguration. HSTS erst beim tatsächlichen HTTPS-Host konfigurieren, Subdomains vorher prüfen. Die Header der erreichbaren Seite anschließend mit Browser-Netzwerkansicht oder `curl -I` kontrollieren. Das bestehende GitHub-Pages-Deployment wurde nach dem Upload erfolgreich aktualisiert. Die zusätzliche Header-Vorlage ist dort nicht wirksam; die Meta-CSP bleibt aktiv.

Die Platzhalter in Impressum und Datenschutz sind unvollständig. Betreiber, Hoster/Logs, Rechtsgrundlagen, Rechte und eingesetzte Dienste konkret prüfen. Auch für die bereits öffentlich erreichbare Demo müssen deren Betreiberangaben vervollständigt werden. Der Kartenmechanismus allein beweist keine rechtliche Konformität.

## Dependencies und Wartung

`package.json` und `pnpm-lock.yaml` fixieren die tatsächlich geprüfte Installation. Dependabot erstellt wöchentliche Paket- und monatliche Actions-Updates. Three.js-Updates erfordern nach Installation `pnpm sync-vendor`; die generierten Vendor-Dateien und Lockdatei mitcommitten. CI schlägt bei Abweichungen fehl. Updates nicht ungeprüft automatisch zusammenführen. Die Generatorversion (esbuild) ebenfalls im Lockfile belassen. Original-Three.js-Lizenz liegt unter `vendor/`.

Lokale Fontdateien wurden übernommen; `fonts/LIZENZ.txt` enthält lediglich einen bisherigen OFL-Hinweis. Vollständige Lizenztexte und Herkunft müssen vor Verkauf/Weitergabe anhand der tatsächlichen Fontdateien bestätigt und ergänzt werden. Kein vollständiger Rechtenachweis wird behauptet.

Checkliste: [CHECKLISTE.md](CHECKLISTE.md). Sicherheitsgrenzen und Recovery: [SECURITY.md](SECURITY.md).
