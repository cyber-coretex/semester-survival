# Semester Survival

`index.html` im Browser öffnen. Der mitgelieferte LEVIS-Stundenplan wird beim ersten Aufruf automatisch importiert und gespeichert. Unter **Settings** lassen sich Kalender austauschen und den Stundenplan bearbeiten. Oben auf jeder Ansicht zwischen Gruppe 1 und Gruppe 2 umschalten; die Wahl wird gespeichert. Kein Build, keine Abhängigkeiten, keine Netzwerkzugriffe. Kalender, Mapping, Semesterdaten und Designauswahl bleiben im lokalen Browserspeicher.

Falls der Browser localStorage für lokale Dateien blockiert, in diesem Ordner `python -m http.server 8080` starten und `http://localhost:8080` öffnen. Speicher ist pro Browser und Adresse getrennt.

## Konfiguration

Semesterbeginn, -ende, Wochenanzahl und Fächer-Mapping unter Settings bearbeiten. Die Standardwerte stehen in `js/subjects.js`. Unbekannte Fächer werden ebenfalls angezeigt. VL/VO zählen als VL; UE/Übung/Labor/PR als UE; andere Termine als OTHER. Alle zeitgebundenen Kalendertermine werden gezählt: bitte einen Kalender mit den gewünschten Lehrveranstaltungen exportieren.

Das Design bleibt eine helle, einfache HTML-Homepage. Die Sonne steigt abhängig vom konfigurierten Semesterbeginn und -ende langsam über den Horizont. Das ist Zeitfortschritt; die Event-Zähler berechnen sich unabhängig davon. Eigene Memes im Ordner `memes` ablegen und in `js/memes.js` eintragen.

## Kalenderunterstützung

ICS mit gefalteten Zeilen, Text-Escapes, DTSTART, DTEND oder DURATION, SUMMARY, DESCRIPTION und LOCATION. Lokale Zeiten, UTC (`Z`) und IANA-TZID wie Europe/Berlin werden unterstützt. Wiederholungen: DAILY, WEEKLY (BYDAY, WKST), MONTHLY (positive BYMONTHDAY), YEARLY, INTERVAL, COUNT, UNTIL; außerdem EXDATE, RDATE und RECURRENCE-ID einschließlich Absagen. Nicht unterstützte Regeln werden mit einer Fehlermeldung abgewiesen, statt unbemerkt falsch gezählt zu werden. Proprietäre Zeitzonennamen bitte beim Export in UTC umwandeln. Ganztägige Termine werden ausgelassen. Unbefristete Serien werden bis zum konfigurierten Semesterende aufgelöst; nach Änderung dieses Datums neu importieren. Höchstens 30.000 Termine und 10 MB pro Datei.

Der Tagesplan ordnet Termine ihrem lokalen Startdatum zu; Termine über Mitternacht bleiben beim Starttag. Eine Veranstaltung zählt ab ihrer Endzeit als überstanden. Pausen zählen zur Tagesdauer. Kalenderimport ersetzt den vorherigen Kalender erst nach erfolgreicher Analyse und Speicherung.

## Dateien

- `js/calendar.js`: ICS-Parser und Wiederholungen
- `js/countdown.js`: Tageszustand und Countdown
- `js/statistics.js`: Fach-, Event- und Tageszähler
- `js/designEvolution.js`: Semesterwoche und Sonnenaufgang
- `js/app.js`: UI und Speicherung
- `css/`: Grundlayout und heller HTML-Stil

`tests.html` im Browser öffnen, um die automatischen Logiktests auszuführen.

Der korrigierte LEVIS-Export „LEVIS Stundenplan (1).ics“ ersetzt beim nächsten Öffnen einmalig den zuvor eingebetteten falschen Kalender, auch in bestehenden Browserinstallationen. Termine behalten ihre tatsächlichen Daten. Gemeinsame Veranstaltungen sind in beiden Gruppen sichtbar; Tagesplan, Countdown, Kalender und Statistiken berücksichtigen die ausgewählte Gruppe.
