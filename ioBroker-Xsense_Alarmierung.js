/************************************************************
 *                                                          *
 *          🚒🔥🚨 XSENSE RAUCHALARM V1.3 FINAL 🚨🔥🚒       *
 *                                                          *
 *                    ioBroker JavaScript                   *
 *                                                          *
 ************************************************************/


/************************************************************
 *                                                          *
 *                    KONFIGURATION                         *
 *                                                          *
 *        ⚠️  NORMALERWEISE NUR HIER ÄNDERN!               *
 *                                                          *
 ************************************************************/


const CONFIG = {


    // ======================================================
    // 🚨 XSENSE RAUCHMELDER
    // ======================================================

    rauchmelder: {

        'RM WoZi-EG': {

            raum:
                'Wohnzimmer im Erdgeschoss',

            alarmStatus:
                'xsense.0.devices.xxxxxx.xxxxxx.00000001.alarmStatus'

        }

        // Weitere Rauchmelder später hier ergänzen:
        //
        // 'RM Küche-EG': {
        //
        //     raum:
        //         'Küche im Erdgeschoss',
        //
        //     alarmStatus:
        //         'xsense.0.devices.XXXX.XXXXXXXX.alarmStatus'
        //
        // }

    },


    // ======================================================
    // 🔊 ALEXA / ECHO-GERÄTE
    // ======================================================

    alexa: [

        {
            name:
                'Wohnzimmer',

            speak:
                'alexa2.0.Echo-Devices.xxxxxx.Commands.speak',

            lautstaerke:
                100
        }

        // Weitere Echos:
        //
        // {
        //     name:
        //         'Küche',
        //
        //     speak:
        //         'alexa2.0.Echo-Devices.XXXXXXXX.Commands.speak',
        //
        //     lautstaerke:
        //         80
        // }

    ],


    // ======================================================
    // 📢 BENACHRICHTIGUNGEN
    // ======================================================

    benachrichtigungen: {

        email:
            true,

        telegram:
            true,

        whatsapp:
            true,

        alexa:
            true

    },


    // ======================================================
    // 📱 TELEGRAM
    // ======================================================

    telegramInstance:
        'telegram.0',

    telegramChatId:
        '',


    // ======================================================
    // 💬 WHATSAPP
    // ======================================================

    whatsappInstance:
        'whatsapp-cmb.0',


    // ======================================================
    // 📧 E-MAIL
    // ======================================================

    emailInstance:
        'email',

    emailFrom:
        'YOUR-EMAIL',

    emailTo:
        'YOUR-EMAIL',


    // ======================================================
    // 🔊 ALEXA WIEDERHOLUNG
    // ======================================================

    alexaWiederholungMinuten:
        5,


    // ======================================================
    // ⏱️ MAXIMALE TESTALARM-DAUER
    // ======================================================

    testalarmDauerMinuten:
        10,


    // ======================================================
    // 📝 ALARMTEXTE
    // ======================================================

    texte: {

        // --------------------------------------------------
        // ECHTER ALARM
        // --------------------------------------------------

        alarm:
            '🚒🔥🚨 RAUCHALARM! 🚨🔥🚒\n\nIm {raum} wurde Rauch erkannt. Bitte überprüfen Sie umgehend den Rauchmelder!',


        // --------------------------------------------------
        // ALEXA-WIEDERHOLUNG
        // --------------------------------------------------

        alarmWiederholung:
            '🚒🔥🚨 ACHTUNG! RAUCHALARM WEITERHIN AKTIV! 🚨🔥🚒\n\nDer Rauchalarm im {raum} ist weiterhin aktiv. Bitte überprüfen Sie den Rauchmelder!',


        // --------------------------------------------------
        // TESTALARM
        // --------------------------------------------------

        test:
            '🚒🔥🚨 TESTALARM! 🚨🔥🚒\n\nDies ist ein Test der XSense-Rauchalarmierung. Rauchalarm im {raum}.',


        // --------------------------------------------------
        // TEST-WIEDERHOLUNG
        // --------------------------------------------------

        testWiederholung:
            '🚒🔥🚨 TESTALARM WEITERHIN AKTIV! 🚨🔥🚒\n\nDer Testalarm im {raum} ist weiterhin aktiv.'

    }

};


/************************************************************
 *                                                          *
 *                    INTERNE VARIABLEN                     *
 *                                                          *
 ************************************************************/


const alarmAktiv = {};

const testAlarmAktiv = {};

const alexaTimer = {};

const testAlarmTimer = {};

const testAlexaTimer = {};

const alarmGemeldet = {};

const testAlarmGemeldet = {};


/************************************************************
 *                                                          *
 *                    HILFSFUNKTIONEN                       *
 *                                                          *
 ************************************************************/


function textErsetzen(text, raum) {

    return text.replace(
        /\{raum\}/g,
        raum
    );

}


/************************************************************
 *                                                          *
 *             TEXT FÜR ALEXA BEREINIGEN                    *
 *                                                          *
 *    Emojis werden nur für Alexa entfernt.                 *
 *    Telegram / WhatsApp / E-Mail behalten sie.            *
 *                                                          *
 ************************************************************/


function textFuerAlexa(text) {

    if (!text) {
        return '';
    }


    let alexaText =
        String(text);


    // Emoji-Bereiche entfernen
    alexaText =
        alexaText.replace(
            /[\u{1F000}-\u{1FAFF}]/gu,
            ''
        );


    // Weitere Symbole entfernen
    alexaText =
        alexaText.replace(
            /[\u{2600}-\u{27BF}]/gu,
            ''
        );


    // Emoji-Varianten entfernen
    alexaText =
        alexaText.replace(
            /[\uFE0E\uFE0F]/g,
            ''
        );


    // Mehrere Leerzeichen zusammenfassen
    alexaText =
        alexaText.replace(
            /\s+/g,
            ' '
        );


    return alexaText.trim();

}


/************************************************************
 *                                                          *
 *                 WHATSAPP FORMATIERUNG                    *
 *                                                          *
 ************************************************************/


function whatsappFormatieren(
    text,
    istTest
) {

    if (!text) {
        return '';
    }


    let whatsappText =
        String(text);


    // ------------------------------------------------------
    // Überschrift fett
    // ------------------------------------------------------

    if (istTest) {

        whatsappText =
            whatsappText.replace(
                '🚒🔥🚨 TESTALARM! 🚨🔥🚒',
                '*🚒🔥🚨 TESTALARM! 🚨🔥🚒*'
            );

        whatsappText =
            whatsappText.replace(
                '🚒🔥🚨 TESTALARM WEITERHIN AKTIV! 🚨🔥🚒',
                '*🚒🔥🚨 TESTALARM WEITERHIN AKTIV! 🚨🔥🚒*'
            );

    } else {

        whatsappText =
            whatsappText.replace(
                '🚒🔥🚨 RAUCHALARM! 🚨🔥🚒',
                '*🚒🔥🚨 RAUCHALARM! 🚨🔥🚒*'
            );

        whatsappText =
            whatsappText.replace(
                '🚒🔥🚨 ACHTUNG! RAUCHALARM WEITERHIN AKTIV! 🚨🔥🚒',
                '*🚒🔥🚨 ACHTUNG! RAUCHALARM WEITERHIN AKTIV! 🚨🔥🚒*'
            );

    }


    return whatsappText;

}


/************************************************************
 *                                                          *
 *                    DATENPUNKT SICHER SETZEN               *
 *                                                          *
 ************************************************************/


function setStateSafe(
    id,
    value
) {

    try {

        if (existsState(id)) {

            setState(
                id,
                value
            );

        }

    } catch (e) {

        log(
            'Fehler beim Setzen von ' +
            id +
            ': ' +
            e,
            'error'
        );

    }

}


/************************************************************
 *                                                          *
 *                    ALEXA                                  *
 *                                                          *
 ************************************************************/


function alexaSprechen(text) {

    if (!CONFIG.benachrichtigungen.alexa) {
        return;
    }


    const alexaText =
        textFuerAlexa(text);


    CONFIG.alexa.forEach(
        echo => {

            try {

                let lautstaerke =
                    Number(
                        echo.lautstaerke
                    );


                if (
                    isNaN(lautstaerke)
                ) {

                    lautstaerke =
                        100;

                }


                lautstaerke =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            lautstaerke
                        )
                    );


                const alexaNachricht =
                    lautstaerke +
                    ';' +
                    alexaText;


                setState(
                    echo.speak,
                    alexaNachricht
                );


                log(
                    'Alexa [' +
                    echo.name +
                    '] → ' +
                    alexaNachricht
                );

            } catch (e) {

                log(
                    'Alexa-Fehler [' +
                    echo.name +
                    ']: ' +
                    e,
                    'error'
                );

            }

        }
    );

}


/************************************************************
 *                                                          *
 *                    TELEGRAM                              *
 *                                                          *
 ************************************************************/


function telegramSenden(text) {

    if (!CONFIG.benachrichtigungen.telegram) {
        return;
    }


    try {

        const nachricht = {
            text: text
        };


        if (
            CONFIG.telegramChatId &&
            CONFIG.telegramChatId !== ''
        ) {

            nachricht.chatId =
                CONFIG.telegramChatId;

        }


        sendTo(
            CONFIG.telegramInstance,
            'send',
            nachricht
        );


        log(
            'Telegram → Nachricht gesendet'
        );

    } catch (e) {

        log(
            'Telegram-Fehler: ' +
            e,
            'error'
        );

    }

}


/************************************************************
 *                                                          *
 *                    WHATSAPP                              *
 *                                                          *
 ************************************************************/


function whatsappSenden(
    text,
    istTest
) {

    if (!CONFIG.benachrichtigungen.whatsapp) {
        return;
    }


    try {

        const whatsappText =
            whatsappFormatieren(
                text,
                istTest
            );


        sendTo(
            CONFIG.whatsappInstance,
            'send',
            {
                text:
                    whatsappText
            }
        );


        log(
            'WhatsApp → Nachricht gesendet'
        );

    } catch (e) {

        log(
            'WhatsApp-Fehler: ' +
            e,
            'error'
        );

    }

}


/************************************************************
 *                                                          *
 *                    E-MAIL                                *
 *                                                          *
 ************************************************************/


function emailSenden(
    betreff,
    text,
    istTest
) {

    if (!CONFIG.benachrichtigungen.email) {
        return;
    }


    if (
        !CONFIG.emailFrom ||
        !CONFIG.emailTo
    ) {

        log(
            'E-Mail nicht gesendet: ' +
            'emailFrom oder emailTo fehlt.',
            'warn'
        );

        return;

    }


    try {

        const html =
            emailHtmlErstellen(
                betreff,
                text,
                istTest
            );


        sendTo(
            CONFIG.emailInstance,
            {
                from:
                    CONFIG.emailFrom,

                to:
                    CONFIG.emailTo,

                subject:
                    betreff,

                text:
                    text,

                html:
                    html
            }
        );


        log(
            'E-Mail → Nachricht gesendet'
        );

    } catch (e) {

        log(
            'E-Mail-Fehler: ' +
            e,
            'error'
        );

    }

}


/************************************************************
 *                                                          *
 *                    E-MAIL HTML                           *
 *                                                          *
 ************************************************************/


function emailHtmlErstellen(
    betreff,
    text,
    istTest
) {

    const farbe =
        istTest
            ? '#ef6c00'
            : '#c62828';


    const textHtml =
        String(text)
            .replace(
                /\n/g,
                '<br>'
            );


    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

</head>


<body
style="
margin:0;
padding:0;
background:#eeeeee;
font-family:Arial,Helvetica,sans-serif;
"
>


<div
style="
max-width:650px;
margin:30px auto;
background:#ffffff;
border-radius:10px;
overflow:hidden;
box-shadow:0 3px 12px rgba(0,0,0,0.20);
"
>


    <!-- HEADER -->

    <div
    style="
    background:${farbe};
    color:#ffffff;
    padding:24px;
    text-align:center;
    "
    >

        <div
        style="
        font-size:30px;
        font-weight:bold;
        "
        >

            ${betreff}

        </div>

    </div>


    <!-- INHALT -->

    <div
    style="
    padding:30px;
    color:#222222;
    font-size:16px;
    line-height:1.6;
    "
    >

        ${textHtml}


        <div
        style="
        margin-top:30px;
        padding:18px;
        background:#f5f5f5;
        border-left:5px solid ${farbe};
        "
        >

            <strong>
                XSense Rauchwarnsystem
            </strong>

            <br>

            Automatische Alarmmeldung von ioBroker

        </div>

    </div>


    <!-- FOOTER -->

    <div
    style="
    padding:15px;
    background:#eeeeee;
    text-align:center;
    color:#777777;
    font-size:12px;
    "
    >

        Automatisch generierte Nachricht

    </div>


</div>


</body>

</html>

`;

}


/************************************************************
 *                                                          *
 *                    ALARMMELDUNG                          *
 *                                                          *
 ************************************************************/


function alarmMelden(
    key,
    raum,
    istTest
) {

    const alarmText =
        textErsetzen(
            istTest
                ? CONFIG.texte.test
                : CONFIG.texte.alarm,
            raum
        );


    const betreff =
        istTest
            ? '🚒🔥🚨 TESTALARM! 🚨🔥🚒'
            : '🚒🔥🚨 RAUCHALARM! 🚨🔥🚒';


    log(
        alarmText,
        'warn'
    );


    // ------------------------------------------------------
    // 📱 TELEGRAM
    // ------------------------------------------------------

    telegramSenden(
        alarmText
    );


    // ------------------------------------------------------
    // 💬 WHATSAPP
    // ------------------------------------------------------

    whatsappSenden(
        alarmText,
        istTest
    );


    // ------------------------------------------------------
    // 📧 E-MAIL
    // ------------------------------------------------------

    emailSenden(
        betreff,
        alarmText,
        istTest
    );


    // ------------------------------------------------------
    // 🔊 ALEXA
    // ------------------------------------------------------

    alexaSprechen(
        alarmText
    );

}


/************************************************************
 *                                                          *
 *             ALEXA WIEDERHOLUNG STARTEN                   *
 *                                                          *
 ************************************************************/


function alexaWiederholungStarten(
    key,
    raum,
    istTest
) {


    if (
        istTest
            ? testAlexaTimer[key]
            : alexaTimer[key]
    ) {

        clearTimeout(
            istTest
                ? testAlexaTimer[key]
                : alexaTimer[key]
        );

    }


    const timer =
        setTimeout(
            () => {


                const aktiv =
                    istTest
                        ? testAlarmAktiv[key]
                        : alarmAktiv[key];


                // Alarm wurde bereits beendet
                if (!aktiv) {

                    log(
                        'Alexa-Wiederholung abgebrochen [' +
                        raum +
                        ']'
                    );

                    return;

                }


                const text =
                    textErsetzen(
                        istTest
                            ? CONFIG.texte.testWiederholung
                            : CONFIG.texte.alarmWiederholung,
                        raum
                    );


                log(
                    text,
                    'warn'
                );


                alexaSprechen(
                    text
                );


                // KEIN weiterer Timer!
                // Die Wiederholung erfolgt nur EINMAL.


            },
            CONFIG.alexaWiederholungMinuten *
            60 *
            1000
        );


    if (istTest) {

        testAlexaTimer[key] =
            timer;

    } else {

        alexaTimer[key] =
            timer;

    }

}


/************************************************************
 *                                                          *
 *             TESTDATENPUNKTE ERSTELLEN                    *
 *                                                          *
 ************************************************************/


const TEST_DP =
    '0_userdata.0.XSense.Testalarm';


function testStateErstellen(
    name,
    commonName
) {

    const id =
        TEST_DP +
        '.' +
        name;


    if (!existsState(id)) {

        createState(
            id,
            false,
            {
                name:
                    commonName,

                type:
                    'boolean',

                role:
                    'button',

                read:
                    true,

                write:
                    true,

                def:
                    false
            }
        );

    }

}


testStateErstellen(
    'Alarm',
    'Kompletten XSense-Testalarm auslösen'
);


testStateErstellen(
    'Telegram',
    'Telegram-Testalarm auslösen'
);


testStateErstellen(
    'WhatsApp',
    'WhatsApp-Testalarm auslösen'
);


testStateErstellen(
    'Email',
    'E-Mail-Testalarm auslösen'
);


testStateErstellen(
    'Alexa',
    'Alexa-Testalarm auslösen'
);


testStateErstellen(
    'Alexa_Wiederholung',
    'Alexa-Wiederholung testen'
);


/************************************************************
 *                                                          *
 *                    TEST: TELEGRAM                        *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.Telegram',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const raum =
            Object.values(
                CONFIG.rauchmelder
            )[0].raum;


        const text =
            textErsetzen(
                CONFIG.texte.test,
                raum
            );


        telegramSenden(
            text
        );


        setStateSafe(
            TEST_DP + '.Telegram',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *                    TEST: WHATSAPP                        *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.WhatsApp',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const raum =
            Object.values(
                CONFIG.rauchmelder
            )[0].raum;


        const text =
            textErsetzen(
                CONFIG.texte.test,
                raum
            );


        whatsappSenden(
            text,
            true
        );


        setStateSafe(
            TEST_DP + '.WhatsApp',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *                    TEST: E-MAIL                          *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.Email',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const raum =
            Object.values(
                CONFIG.rauchmelder
            )[0].raum;


        const text =
            textErsetzen(
                CONFIG.texte.test,
                raum
            );


        emailSenden(
            '🚒🔥🚨 TESTALARM! 🚨🔥🚒',
            text,
            true
        );


        setStateSafe(
            TEST_DP + '.Email',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *                    TEST: ALEXA                           *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.Alexa',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const raum =
            Object.values(
                CONFIG.rauchmelder
            )[0].raum;


        const text =
            textErsetzen(
                CONFIG.texte.test,
                raum
            );


        alexaSprechen(
            text
        );


        setStateSafe(
            TEST_DP + '.Alexa',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *              TEST: ALEXA WIEDERHOLUNG                   *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.Alexa_Wiederholung',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const raum =
            Object.values(
                CONFIG.rauchmelder
            )[0].raum;


        const text =
            textErsetzen(
                CONFIG.texte.testWiederholung,
                raum
            );


        alexaSprechen(
            text
        );


        setStateSafe(
            TEST_DP + '.Alexa_Wiederholung',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *              KOMPLETTER TESTALARM                        *
 *                                                          *
 ************************************************************/


on(
    {
        id:
            TEST_DP + '.Alarm',

        change:
            'ne'
    },
    obj => {


        if (
            obj.state.val !== true
        ) {

            return;

        }


        const eintrag =
            Object.entries(
                CONFIG.rauchmelder
            )[0];


        if (!eintrag) {

            log(
                'Kein Rauchmelder konfiguriert.',
                'error'
            );

            setStateSafe(
                TEST_DP + '.Alarm',
                false
            );

            return;

        }


        const key =
            eintrag[0];


        const daten =
            eintrag[1];


        const raum =
            daten.raum;


        // --------------------------------------------------
        // TESTALARM AKTIVIEREN
        // --------------------------------------------------

        testAlarmAktiv[key] =
            true;

        testAlarmGemeldet[key] =
            true;


        log(
            '🚒🔥🚨 TESTALARM gestartet: ' +
            raum,
            'warn'
        );


        // --------------------------------------------------
        // ALARM MELDEN
        // --------------------------------------------------

        alarmMelden(
            key,
            raum,
            true
        );


        // --------------------------------------------------
        // ALEXA-WIEDERHOLUNG
        // --------------------------------------------------

        alexaWiederholungStarten(
            key,
            raum,
            true
        );


        // --------------------------------------------------
        // ALTEN TEST-TIMER LÖSCHEN
        // --------------------------------------------------

        if (
            testAlarmTimer[key]
        ) {

            clearTimeout(
                testAlarmTimer[key]
            );

        }


        // --------------------------------------------------
        // TESTALARM AUTOMATISCH BEENDEN
        // --------------------------------------------------

        testAlarmTimer[key] =
            setTimeout(
                () => {


                    testAlarmAktiv[key] =
                        false;

                    testAlarmGemeldet[key] =
                        false;


                    if (
                        testAlexaTimer[key]
                    ) {

                        clearTimeout(
                            testAlexaTimer[key]
                        );

                        testAlexaTimer[key] =
                            null;

                    }


                    log(
                        '🚒🔥🚨 TESTALARM beendet: ' +
                        raum
                    );


                },
                CONFIG.testalarmDauerMinuten *
                60 *
                1000
            );


        setStateSafe(
            TEST_DP + '.Alarm',
            false
        );

    }
);


/************************************************************
 *                                                          *
 *                ECHTER XSENSE ALARM                       *
 *                                                          *
 ************************************************************/


Object.entries(
    CONFIG.rauchmelder
).forEach(
    ([key, daten]) => {


        alarmAktiv[key] =
            false;


        alarmGemeldet[key] =
            false;


        testAlarmAktiv[key] =
            false;


        testAlarmGemeldet[key] =
            false;


        on(
            {
                id:
                    daten.alarmStatus,

                change:
                    'ne'
            },
            obj => {


                const aktiv =
                    obj.state.val === true;


                // ==========================================
                // 🚨 ALARM EIN
                // ==========================================

                if (aktiv) {


                    // Bereits gemeldet?
                    if (
                        alarmGemeldet[key]
                    ) {

                        return;

                    }


                    alarmAktiv[key] =
                        true;

                    alarmGemeldet[key] =
                        true;


                    log(
                        '🚒🔥🚨 ECHTER RAUCHALARM: ' +
                        daten.raum,
                        'warn'
                    );


                    alarmMelden(
                        key,
                        daten.raum,
                        false
                    );


                    alexaWiederholungStarten(
                        key,
                        daten.raum,
                        false
                    );

                }


                // ==========================================
                // ✅ ALARM AUS
                // ==========================================

                else {


                    alarmAktiv[key] =
                        false;

                    alarmGemeldet[key] =
                        false;


                    // Alexa-Wiederholung abbrechen
                    if (
                        alexaTimer[key]
                    ) {

                        clearTimeout(
                            alexaTimer[key]
                        );

                        alexaTimer[key] =
                            null;

                    }


                    log(
                        'XSense Alarm beendet: ' +
                        daten.raum
                    );

                }

            }
        );


        log(
            'XSense Rauchmelder überwacht: ' +
            key +
            ' → ' +
            daten.alarmStatus
        );

    }
);


/************************************************************
 *                                                          *
 *                    STARTMELDUNG                          *
 *                                                          *
 ************************************************************/


log(
    '🚒🔥🚨 XSense Rauchalarm V1.3 FINAL gestartet 🚨🔥🚒',
    'info'
);


log(
    'Überwachte Rauchmelder: ' +
    Object.keys(
        CONFIG.rauchmelder
    ).length,
    'info'
);


log(
    'Konfigurierte Alexa-Geräte: ' +
    CONFIG.alexa.length,
    'info'
);


log(
    'Testdatenpunkte: ' +
    TEST_DP,
    'info'
);