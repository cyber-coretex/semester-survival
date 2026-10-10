# Semester Survival

index.html direkt öffnen. Statische Website mit veröffentlichtem LEVIS-Kalender, Gruppenumschalter, Countdown, Kalender, Statistiken und Coffee-Seite. Browserbesucher können Kalender, Fächer-Mapping und Semesterkonfiguration nicht über die Seite ändern. Kalender und Konfiguration kommen bei jedem Start aus den veröffentlichten Dateien; alte localStorage-Importe werden ignoriert. Gespeichert wird nur die Gruppenwahl.

## Kalender ändern – nur als Repository-Eigentümer

Im WebsiteUni-Ordner in PowerShell:

    .\Import-Kalender.ps1 -CalendarPath "C:\Users\arnol\Downloads\Neuer Stundenplan.ics"

Anschließend index.html prüfen, Änderungen committen und pushen. Semesterbeginn, Ende und Mapping in js/subjects.js ändern. Aktuell beginnt das Semester passend zum ersten aktuellen Unterrichtstag am 10.09.2026 und endet am 31.01.2027.

Das ist eine statische Website: Repository-Schreibrechte bestimmen, wer den veröffentlichten Stand ändern kann. Es gibt kein Browser-Adminpasswort und keine Editieroberfläche. Benutzer können mit Entwicklertools ihre eigene Seitenansicht manipulieren, aber dadurch keine veröffentlichten Daten ändern.

## Kaffeekauf hinzufügen – nur als Repository-Eigentümer

js/coffee.js bearbeiten. Beispiel für die purchases-Liste:

    purchases: [
      { buyer: 'cyber', date: '2026-09-15', packs: 1 },
      { buyer: 'Name', date: '2026-10-10', packs: 1 }
    ]

Datum YYYY-MM-DD, packs = Anzahl der gekauften 250-g-Packungen. Jede kostet 12 EUR. Cyber ist als erster Käufer mit einer Packung eingetragen; das Kaufdatum ist der 15.09.2026. Danach committen/pushen. Alle Besucher sehen nach dem Laden denselben veröffentlichten Käuferstand. Es gibt keine öffentliche Eingabe.

## Kaffeerechnung

Vergangene abgeschlossene Uni-Tage innerhalb des Semesters und der ausgewählten Gruppe × 3,80 EUR, minus bereits gekaufte Packungen × 12 EUR. Ein Tag zählt erst ab dem Ende seines letzten Termins. Zukünftige Kaufdaten zählen nicht als bisherige Ausgaben. Alte Kalendertermine außerhalb des konfigurierten Semesters werden für Kaffee nicht gezählt.

Der historische Preis ist pro Person, die Packungskosten gelten für die Gemeinschaft. Die Anzeige zieht zur Orientierung die gesamten Gemeinschaftskosten von der früheren Ausgabe einer Person ab. Eine echte gesamte Gruppenersparnis braucht die Anzahl der Kaffeetrinker. Die Semesterhochrechnung zeigt nur die früheren Gesamtkosten (Uni-Tage × 3,80 EUR); zukünftige Kosten sind ohne Verbrauchsdaten nicht seriös prognostizierbar. Es werden keine Tassenanzahl und keine Reichweite einer Packung erfunden.

## Memes

Bilder in memes ablegen, Einträge in js/memes.js ergänzen. Keine externen Requests oder Frameworks. Der Sonnenaufgang folgt der Semesterzeit. Beschreibungen bleiben auch bei Timeraktualisierungen offen und lassen sich wieder schließen.

## Veröffentlichung

Inhalt auf GitHub pushen. Repository Settings → Pages → Deploy from a branch → main → / (root). bundledCalendar.js enthält den öffentlich sichtbaren Kalender. Nur du mit Repository-Schreibrechten veröffentlichst Änderungen. Import-Kalender.ps1 und Tests werden zum Betrieb nicht benötigt.

## Tests

tests.html enthält Countdown-/ICS-Tests. integration-tests.html prüft Gruppenfilter, Schutz vor alten lokalen Kalenderdaten, stabile Beschreibungen und Coffee-Berechnung. Integrationstests lokal mit separatem Browserprofil ausführen: sie ändern die lokale Gruppenwahl zu Testzwecken.
## Ergänzungen vom 10.10.2026

- Beurteilungsfindung, die LEVIS-Schreibweise Beuteilungsfindung und Notenfindung/Benotung werden zentral in js/subjects.js ausgeschlossen. Sie tauchen weder im Tagesplan noch im Kalender auf und zählen nicht für Timer, Semesterstatistiken, Wochenenden oder Kaffee.
- Phillip kaufte am 07.10.2026 eine weitere 250-g-Packung für 12 EUR. Die Käuferliste bleibt vom Repository-Eigentümer gepflegt.
- Games: Tic-Tac-Toe gegen den Computer oder zu zweit am selben Gerät. Spiele bleiben lokal; keine Onlinegegner.
- Breaking News: Die Liste SURVIVAL_NEWS in js/news.js bearbeiten, committen und pushen. Beispiel:

      { title: 'Raumänderung', text: 'Deine Nachricht', date: '2026-10-10', important: true }

  In der Website können Besucher Meldungen lesen/einklappen, aber nicht ändern. Eine leere Liste zeigt keine aktuellen Meldungen.
- Mental Health ist eine einfache statische Seite für eigene Texte. Gemeinsames Rating und Supabase wurden entfernt. Die Website benötigt keinen zentralen Speicher und stellt keine externen API-Anfragen.