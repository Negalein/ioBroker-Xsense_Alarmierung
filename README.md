# 🚨 XSense Alarmbenachrichtigung für ioBroker

Eine mehrstufige Alarmbenachrichtigung für XSense Rauchmelder in ioBroker.

Das Skript überwacht den XSense-Alarmstatus und benachrichtigt bei einem Rauchalarm über mehrere Kanäle:

- 📱 Telegram
- 💬 WhatsApp
- 📧 E-Mail
- 🔊 Amazon Alexa

Zusätzlich erfolgt nach 5 Minuten eine **einmalige Alexa-Wiederholung**, wenn der Alarm weiterhin aktiv ist.

---

# 📋 Funktionen

## 🚨 Rauchalarm

Das Skript überwacht den XSense-Datenpunkt:

`xsense.0.devices.Nega.163988C7.00000001.alarmStatus`

Ein Alarm wird ausschließlich bei einem Zustandswechsel von `false → true` ausgelöst.

Dadurch wird verhindert, dass während eines bereits aktiven Alarms wiederholt Nachrichten verschickt werden.

---

# 📱 Telegram

Bei einem erkannten Rauchalarm wird eine Telegram-Nachricht gesendet.

Alarmtext:

**🚒🔥🚨 RAUCHALARM! 🚨🔥🚒**

Die Telegram-Benachrichtigung wird pro Alarm nur einmal gesendet.

---

# 💬 WhatsApp

Zusätzlich wird eine WhatsApp-Nachricht über den ioBroker WhatsApp-Adapter gesendet.

Alarmtext:

**🚒🔥🚨 RAUCHALARM! 🚨🔥🚒**

Die WhatsApp-Nachricht verwendet die konfigurierte Formatierung.

---

# 📧 E-Mail

Bei einem Alarm wird eine formatierte HTML-E-Mail versendet.

Die E-Mail enthält die wichtigsten Informationen zum Alarm, unter anderem:

- Rauchmelder
- Raum
- Alarmstatus
- Zeitpunkt
- Alarmhinweis

Die derzeit verwendete Konfiguration beinhaltet:

- Absender: `iobroker@nega.at`
- Empfänger: `christian@nega.at`

Diese Angaben müssen bei einer eigenen Installation entsprechend angepasst werden.

---

# 🔊 Amazon Alexa

Alexa wird unmittelbar nach Erkennung des Alarms angesprochen.

Der Alexa-Datenpunkt verwendet das Format:

`100;Text`

Die Lautstärke kann pro Echo-Gerät konfiguriert werden.

Beispielkonfiguration:

- Name: `Wohnzimmer`
- Speak-Datenpunkt: `alexa2.0.Echo-Devices.G2A0XL07022603EU.Commands.speak`
- Lautstärke: `100`

Weitere Echo-Geräte können entsprechend ergänzt werden.

---

# 🔊 Alexa-Wiederholung

Bleibt der Rauchalarm weiterhin aktiv, erfolgt nach **5 Minuten genau eine weitere Alexa-Durchsage**.

Wiederholungstext:

**🚒🔥🚨 ACHTUNG! RAUCHALARM WEITERHIN AKTIV! 🚨🔥🚒**

Danach erfolgt keine weitere Wiederholung.

Wird der Alarm vor Ablauf der 5 Minuten beendet, wird die geplante Wiederholung nicht ausgeführt.

---

# 🛡️ Vermeidung mehrfacher Alarme

Der XSense-Datenpunkt `alarmStatus` kann nach einem Alarm noch mehrere Minuten auf `true` bleiben.

Das Skript reagiert deshalb ausschließlich auf den Zustandswechsel:

`false → true`

Während `alarmStatus = true` bleibt, werden keine weiteren Telegram-, WhatsApp- oder E-Mail-Nachrichten ausgelöst.

Auch Alexa wird nicht mehrfach angesprochen.

Die Wiederholung nach 5 Minuten ist eine ausdrücklich definierte Ausnahme und erfolgt maximal einmal.

---

# 🔄 Alarm beendet

Wenn der XSense-Alarm wieder auf `false` wechselt, wird der interne Alarmstatus zurückgesetzt.

Es wird keine zusätzliche Meldung wie „Alarm beendet“ verschickt.

Beim nächsten Zustandswechsel von `false → true` kann erneut ein vollständiger Alarm ausgelöst werden.

---

# 🧪 Testfunktionen

Für die einzelnen Benachrichtigungskanäle stehen separate Test-Datenpunkte zur Verfügung.

Testbereich:

`0_userdata.0.XSense.Testalarm`

Test-Datenpunkte:

- `0_userdata.0.XSense.Testalarm.Alarm`
- `0_userdata.0.XSense.Testalarm.Telegram`
- `0_userdata.0.XSense.Testalarm.WhatsApp`
- `0_userdata.0.XSense.Testalarm.Email`
- `0_userdata.0.XSense.Testalarm.Alexa`
- `0_userdata.0.XSense.Testalarm.Alexa_Wiederholung`

Dadurch können die einzelnen Benachrichtigungskanäle unabhängig voneinander getestet werden.

---

# 🧪 Telegram testen

Datenpunkt:

`0_userdata.0.XSense.Testalarm.Telegram`

Auf `true` setzen.

Es wird eine Testmeldung über Telegram gesendet.

---

# 🧪 WhatsApp testen

Datenpunkt:

`0_userdata.0.XSense.Testalarm.WhatsApp`

Auf `true` setzen.

Es wird eine Testmeldung über WhatsApp gesendet.

---

# 🧪 E-Mail testen

Datenpunkt:

`0_userdata.0.XSense.Testalarm.Email`

Auf `true` setzen.

Es wird eine Test-E-Mail versendet.

---

# 🧪 Alexa testen

Datenpunkt:

`0_userdata.0.XSense.Testalarm.Alexa`

Auf `true` setzen.

Alexa gibt die konfigurierte Testansage aus.

---

# 🧪 Alexa-Wiederholung testen

Datenpunkt:

`0_userdata.0.XSense.Testalarm.Alexa_Wiederholung`

Auf `true` setzen.

Damit kann die Wiederholungsansage unabhängig vom echten Rauchmelder getestet werden.

---

# 🔧 Voraussetzungen

Benötigt werden:

- ioBroker
- XSense ioBroker Adapter
- JavaScript-Adapter
- Telegram-Adapter
- WhatsApp-Adapter
- E-Mail-Adapter
- Alexa2-Adapter
- entsprechend konfigurierte Geräte und Datenpunkte

Die jeweiligen Benachrichtigungskanäle müssen in ioBroker eingerichtet und funktionsfähig sein.

---

# 📦 Installation

1. Im ioBroker JavaScript-Adapter ein neues Skript erstellen.
2. Das Skript beispielsweise `XSense Alarmbenachrichtigung` nennen.
3. Den vollständigen JavaScript-Code einfügen.
4. Die Konfiguration überprüfen.
5. Telegram-Empfänger konfigurieren.
6. WhatsApp-Empfänger konfigurieren.
7. E-Mail-Absender und Empfänger konfigurieren.
8. Alexa-Datenpunkte konfigurieren.
9. Das Skript speichern und starten.
10. Anschließend die einzelnen Testfunktionen durchführen.

---

# ⚙️ XSense konfigurieren

Aktuell verwendet das Projekt:

- Rauchmelder: `RM WoZi-EG`
- Raum: `Wohnzimmer im Erdgeschoss`
- Alarm-Datenpunkt: `xsense.0.devices.Nega.163988C7.00000001.alarmStatus`

Der relevante XSense-Datenpunkt ist:

`xsense.0.devices.Nega.163988C7.00000001.alarmStatus`

---

# 📱 Telegram konfigurieren

Die Telegram-Konfiguration muss an die eigene ioBroker-Installation angepasst werden.

Insbesondere muss der eigene Telegram-Empfänger beziehungsweise die eigene Chat-ID eingetragen werden.

Es sollten keine persönlichen Chat-IDs in öffentlichen GitHub-Repositories veröffentlicht werden.

---

# 💬 WhatsApp konfigurieren

Die WhatsApp-Konfiguration muss an die eigene ioBroker-Installation angepasst werden.

Der Empfänger sollte entsprechend der eigenen WhatsApp-Adapter-Konfiguration eingetragen werden.

---

# 📧 E-Mail konfigurieren

Die E-Mail-Konfiguration kann beispielsweise so aussehen:

- From: `iobroker@nega.at`
- To: `christian@nega.at`

Für eine Veröffentlichung auf GitHub sollten persönliche E-Mail-Adressen durch die eigenen Werte ersetzt werden.

---

# 🔊 Alexa konfigurieren

Ein Echo-Gerät kann beispielsweise so konfiguriert werden:

- Name: `Wohnzimmer`
- Speak-Datenpunkt: `alexa2.0.Echo-Devices.G2A0XL07022603EU.Commands.speak`
- Lautstärke: `100`

Weitere Echo-Geräte können als zusätzliche Einträge ergänzt werden.

---

# 🔇 Emojis bei Alexa

Die visuellen Alarmmeldungen verwenden Emojis.

Vor der Alexa-Ausgabe werden diese jedoch entfernt.

Dadurch spricht Alexa nicht die Emoji-Bezeichnungen aus, sondern gibt eine normale Sprachmeldung aus.

Beispielsweise wird aus:

**🚒🔥🚨 RAUCHALARM! 🚨🔥🚒**

eine für Alexa geeignete Sprachmeldung ohne Emojis.

---

# 🚨 Alarmablauf

Der normale Ablauf sieht folgendermaßen aus:

```text
XSense alarmStatus
        │
        ▼
   false → true
        │
        ├───────────────┐
        │               │
        ▼               ▼
   📱 Telegram      💬 WhatsApp
        │               │
        └───────┬───────┘
                │
                ├── 📧 E-Mail
                │
                └── 🔊 Alexa
                        │
                        ▼
                   5 Minuten
                        │
                        ▼
               Alarm noch aktiv?
                    │       │
                   JA      NEIN
                    │       │
                    ▼       └── keine Wiederholung
                   🔊
             Alexa einmalig
```

---

# ⚠️ Bewusste Trennung von der Notfallsteuerung

Dieses Skript ist ausschließlich für die **Alarmbenachrichtigung** zuständig.

Es öffnet keine Rollos, entriegelt keine Türen und schaltet keine Lichter.

Die Gebäudeautomation befindet sich bewusst in einem separaten Projekt:

**XSense Notfallsteuerung**

Dadurch können beide Systeme unabhängig voneinander betrieben, getestet und weiterentwickelt werden.

---

# 🔐 Sicherheit und Datenschutz

Dieses Projekt kann persönliche Informationen wie:

- Telegram Chat-IDs
- WhatsApp-Empfänger
- E-Mail-Adressen
- interne ioBroker-Datenpunkte
- Alexa-Geräte-IDs

enthalten.

### ⚠️ Vor Veröffentlichung auf GitHub unbedingt prüfen:

- keine persönlichen Chat-IDs
- keine Passwörter
- keine API-Schlüssel
- keine Zugangsdaten
- keine privaten E-Mail-Adressen
- keine internen Informationen, die nicht öffentlich sein sollen

im Repository veröffentlichen.

---

# ⚠️ Haftungsausschluss

Dieses Projekt stellt eine individuelle Alarmbenachrichtigung für ioBroker dar und ersetzt keine zertifizierte Brandmelde- oder Alarmanlage.

Die tatsächliche Funktion hängt unter anderem von folgenden Komponenten ab:

- XSense Rauchmelder
- ioBroker
- XSense Adapter
- Telegram
- WhatsApp
- E-Mail-System
- Alexa
- Netzwerk
- Stromversorgung
- Internetverbindung

Der Autor übernimmt keine Haftung für Schäden oder Folgen, die durch Fehlkonfiguration, Softwarefehler, Hardwarefehler, Netzwerkprobleme, Stromausfälle, Ausfälle externer Dienste oder sonstige Fehler entstehen.

Für sicherheitskritische Anwendungen müssen geeignete, dafür zugelassene Systeme verwendet werden.

---

# 📜 Versionshistorie

## V1.3 – FINAL

- XSense Rauchalarmüberwachung
- Telegram-Benachrichtigung
- WhatsApp-Benachrichtigung
- formatierte HTML-E-Mail
- Alexa-Sprachausgabe
- konfigurierbare Alexa-Lautstärke
- Alexa-Wiederholung nach 5 Minuten
- maximal eine Wiederholung
- Abbruch der Wiederholung bei beendetem Alarm
- keine mehrfachen Alarmmeldungen während eines aktiven Alarms
- separate Test-Datenpunkte
- Emoji-Entfernung für Alexa
- kein zusätzlicher Alarm-Ende-Hinweis
- Unterstützung mehrerer Alexa-Echos

---

# 👤 Autor

**Christian Wimmer**

Copyright © 2026 Christian Wimmer

---

# 📄 Lizenz

MIT License

Copyright (c) 2026 Christian Wimmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
