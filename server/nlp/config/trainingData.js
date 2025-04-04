/**
 * Date de antrenament pentru classifier
 */
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

const trainingData = [
  // 📊 Rapoarte și Calendar
  { text: "calendar", intent: CHAT_INTENTS.SHOW_CALENDAR },
  { text: "rezervari", intent: CHAT_INTENTS.SHOW_CALENDAR },
  { text: "rezervările", intent: CHAT_INTENTS.SHOW_CALENDAR },
  { text: "programul", intent: CHAT_INTENTS.SHOW_CALENDAR },
  { text: "rapoarte", intent: CHAT_INTENTS.SHOW_REPORTS },
  { text: "statistici", intent: CHAT_INTENTS.SHOW_REPORTS },
  { text: "raport zilnic", intent: CHAT_INTENTS.SHOW_REPORTS },
  { text: "raport lunar", intent: CHAT_INTENTS.SHOW_REPORTS },
  { text: "raport anual", intent: CHAT_INTENTS.SHOW_REPORTS },

  // 🛒 POS și Vânzări
  { text: "pos", intent: CHAT_INTENTS.SHOW_POS },
  { text: "deschide POS-ul", intent: CHAT_INTENTS.SHOW_POS },
  { text: "vanzare", intent: CHAT_INTENTS.SHOW_POS },
  { text: "vinde", intent: CHAT_INTENTS.SHOW_POS },
  { text: "vinde cafea camera 101", intent: CHAT_INTENTS.SELL_PRODUCT },
  { text: "adauga suc camera 205", intent: CHAT_INTENTS.SELL_PRODUCT },
  { text: "vinde bere 301", intent: CHAT_INTENTS.SELL_PRODUCT },
  { text: "adauga produse camera 102", intent: CHAT_INTENTS.SELL_PRODUCT },

  // 📄 Facturi
  { text: "facturi", intent: CHAT_INTENTS.SHOW_INVOICES },
  { text: "deschide facturile", intent: CHAT_INTENTS.SHOW_INVOICES },
  { text: "facturile", intent: CHAT_INTENTS.SHOW_INVOICES },
  { text: "gestionează facturile", intent: CHAT_INTENTS.SHOW_INVOICES },
  { text: "factura 101", intent: CHAT_INTENTS.SHOW_ROOM_INVOICE },
  { text: "vezi factura camera 205", intent: CHAT_INTENTS.SHOW_ROOM_INVOICE },
  { text: "arată factura 301", intent: CHAT_INTENTS.SHOW_ROOM_INVOICE },

  // 📦 Inventar
  { text: "inventar", intent: CHAT_INTENTS.SHOW_STOCK },
  { text: "stock", intent: CHAT_INTENTS.SHOW_STOCK },
  { text: "stocuri", intent: CHAT_INTENTS.SHOW_STOCK },
  { text: "deschide stocurile", intent: CHAT_INTENTS.SHOW_STOCK },
  { text: "produse", intent: CHAT_INTENTS.SHOW_STOCK },

  // 🏨 Management Camere
  { text: "creeaza cam 101 single 200", intent: CHAT_INTENTS.CREATE_ROOM },
  { text: "adauga camera 205 dubla 300", intent: CHAT_INTENTS.CREATE_ROOM },
  { text: "creeaza camera 301 apartament 500", intent: CHAT_INTENTS.CREATE_ROOM },
  { text: "modifica cam 101", intent: CHAT_INTENTS.MODIFY_ROOM },
  { text: "actualizeaza camera 205", intent: CHAT_INTENTS.MODIFY_ROOM },
  { text: "sterge cam 101", intent: CHAT_INTENTS.DELETE_ROOM },
  { text: "elimina camera 205", intent: CHAT_INTENTS.DELETE_ROOM },
  { text: "problema c101", intent: CHAT_INTENTS.ROOM_PROBLEM },
  { text: "problema camera 205", intent: CHAT_INTENTS.ROOM_PROBLEM },
  { text: "problema 301 frigider stricat", intent: CHAT_INTENTS.ROOM_PROBLEM },
  { text: "probl c102 nu functioneaza aerul conditionat", intent: CHAT_INTENTS.ROOM_PROBLEM },

  // 📞 Adăugare Telefon
  { text: "tel 101 15 mar 0722123456", intent: CHAT_INTENTS.ADD_PHONE },
  { text: "telefon 205 24 apr 0733123456", intent: CHAT_INTENTS.ADD_PHONE },
  { text: "adauga telefon 301 0744123456", intent: CHAT_INTENTS.ADD_PHONE },

  // 🏨 Rezervări
  { text: "rezervare camera dubla pe 14 apr", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezerv o suita pentru Ion Popescu", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezerva o camera twin pentru Andrei Ionescu pe 12-14 mar", intent: CHAT_INTENTS.RESERVATION },
  { text: "vreau dubla pentru 24 feb", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezerva un apartament pentru Mihai Popescu intre 10 si 15 mai", intent: CHAT_INTENTS.RESERVATION },
  { text: "fa o rezervare la hotel pentru Ana pe 5-10 iul", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezervare dubla Mihai 24 feb", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezerva o camera deluxe fumator pe 20-23 august", intent: CHAT_INTENTS.RESERVATION },
  { text: "vreau o camera dubla de pe 12 pana pe 15 iunie", intent: CHAT_INTENTS.RESERVATION },
  { text: "fa o rezervare pentru un apartament in perioada 5-9 sept", intent: CHAT_INTENTS.RESERVATION },
  { text: "rez camera twin 10-12 oct", intent: CHAT_INTENTS.RESERVATION },
  { text: "vreau un apartament 8-12 noiembrie", intent: CHAT_INTENTS.RESERVATION },
  { text: "rezer o camera dubla 3 nopti in decembrie", intent: CHAT_INTENTS.RESERVATION },
  { text: "res o camera single pentru 3 nopti in februarie", intent: CHAT_INTENTS.RESERVATION },

  // 🔄 Modificări de rezervare
  { text: "modifica rezervarea lui Andrei Ionescu pentru 25 mai", intent: CHAT_INTENTS.MODIFY_RESERVATION },
  { text: "vreau sa schimb data rezervării mele pentru 10 martie", intent: CHAT_INTENTS.MODIFY_RESERVATION },
  { text: "schimba rezervarea lui Mihai Popescu la 15 aprilie", intent: CHAT_INTENTS.MODIFY_RESERVATION },
  { text: "muta rezervarea pe 12-15 septembrie", intent: CHAT_INTENTS.MODIFY_RESERVATION },

  // ❌ Anulări de rezervare
  { text: "anuleaza rezervarea lui Mihai Popescu din 20 aprilie", intent: CHAT_INTENTS.CANCEL_RESERVATION },
  { text: "vreau să anulez rezervarea pentru Ana pe 5 iulie", intent: CHAT_INTENTS.CANCEL_RESERVATION },
  { text: "sterge rezervarea mea pentru 10-12 iunie", intent: CHAT_INTENTS.CANCEL_RESERVATION }
];

module.exports = trainingData; 