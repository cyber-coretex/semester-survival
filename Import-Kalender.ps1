param([Parameter(Mandatory = $true)][string]$CalendarPath)
$ErrorActionPreference = 'Stop'
# Run locally as repository owner, then commit and push bundledCalendar.js.
$ics = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $CalendarPath).Path, [Text.Encoding]::UTF8)
if ($ics -notmatch 'BEGIN:VCALENDAR' -or $ics -notmatch 'BEGIN:VEVENT') { throw 'Keine ICS-Kalenderdatei.' }
$scriptText = 'window.SURVIVAL_BUNDLED_ICS = ' + (ConvertTo-Json -InputObject $ics -Compress) + ';'
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'js\bundledCalendar.js'), $scriptText, [Text.UTF8Encoding]::new($false))
Write-Output 'Kalenderdatei aktualisiert. Website lokal prüfen, anschließend committen und pushen.'
