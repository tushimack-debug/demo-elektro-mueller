# Sicherheitsprüfung und Wiederherstellung

Eine statische Seite hat weniger serverseitige Angriffsflächen als ein CMS, ist aber nicht unangreifbar. Relevante Risiken sind kompromittierte Konten, manipulierte Dependencies, unbefugte Änderungen, Browser-Schwachstellen und fehlerhafte Hosting-Konfiguration. Die eigenen Formulare haben keinen Versand-Backend-Endpunkt.

## Prüfgrenzen

Die Tests suchen bekannte Token-/Private-Key-Muster in getrackten Textdateien und prüfen Browserverhalten. Ein negativer Treffer garantiert nicht, dass keine Secrets vorhanden sind. Externe Kontoeinstellungen, tatsächliche Hosting-Header, Rechte an Bestandsmaterial und aktuelle Geschäftsangaben werden damit nicht überprüft. `pnpm audit` untersucht veröffentlichte Advisories der Installation, nicht die gesamte Anwendung. Automatisierte Accessibility-Checks ersetzen keine vollständige manuelle WCAG-Prüfung.

Keine Secrets in HTML, JavaScript, Git-History oder Actions-Logs eintragen. Browser-Code ist öffentlich. Falls ein Schlüssel versehentlich eingecheckt wurde: zuerst sperren/rotieren, dann Historie bereinigen und betroffene Nutzer informieren; bloßes Löschen im letzten Commit reicht nicht. GitHub Secret Scanning/Push Protection aktivieren, sofern für das Repository verfügbar. Actions haben nur lesenden Repositoryzugriff; kein Deployment-Token ist hinterlegt.

## Backup

Vor größeren Änderungen einen geprüft funktionierenden Commit notieren und außerhalb des GitHub-Kontos ein Backup sichern:

```sh
git status --short
git log -1 --format=%H
git bundle create ../website-backup.bundle --all
git bundle verify ../website-backup.bundle
```

Ein Bundle enthält Git-Commits und Branches, **keine** uncommitteten/ignorierten Dateien, Kontoeinstellungen, Domain-Konfiguration oder Recovery-Codes. Diese gesondert und verschlüsselt sichern. Backup getrennt vom Arbeitsgerät/Konto aufbewahren. Regelmäßig einen Testklon aus dem Bundle erstellen und die Seitenprüfung durchführen.

## Fehlerhafte Änderung rückgängig machen

Sauberen Arbeitsstand verwenden. Änderungs-Commit identifizieren, dann normalen Revert erstellen; kein Force-Push:

```sh
git pull --ff-only
git log --oneline -10
git revert <fehlerhafter-commit>
pnpm install --frozen-lockfile
pnpm sync-vendor
pnpm test
pnpm test:browser
git push origin main
```

`<fehlerhafter-commit>` durch den tatsächlich geprüften Commit ersetzen. Falls mehrere Änderungen betroffen sind, einzeln prüfen. Danach beim realen Hoster die saubere Version bereitstellen und die erreichbare Seite überprüfen. Ein Git-Push allein bestätigt keinen erfolgreichen Deploy.

## Kompromittiertes Konto / Vorfall

1. Betroffene Konten von einem vertrauenswürdigen Gerät absichern: Passwort ändern, Sitzungen und verdächtige Tokens/App-Zugriffe widerrufen, 2FA prüfen. Wiederherstellungscodes erneuern, falls betroffen.
2. Verdächtige Deployments stoppen, Zugriffs-/Audit-Logs und Zeitpunkte sichern. Kunden sachlich informieren; mögliche Meldepflichten anhand des tatsächlichen Vorfalls prüfen.
3. Repository-, Actions-, Hosting- und DNS-Änderungen gegen eine bekannte saubere Version vergleichen. Backup nicht ohne Prüfung übernehmen.
4. Sauberen Commit mit aktuellen Dependencies testen und kontrolliert veröffentlichen. Header, DNS, Zertifikat, Kontaktziele und externe Requests prüfen.
5. Ursache, Umfang, Maßnahmen und Zeitpunkt dokumentieren; Zugriffsrechte und Recovery-Prozess verbessern.

Konfigurationsquellen: [Three.js Installation](https://threejs.org/manual/pages/installation.html), [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP).
