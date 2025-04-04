/**
 * Pattern-uri pentru detectarea intențiilor
 */
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

// Dictionar rapid de rutare pentru potriviri exacte
const quickRoute = {
  // Rezervări
  rezervare: CHAT_INTENTS.RESERVATION,
  rezerva: CHAT_INTENTS.RESERVATION,
  modifica: CHAT_INTENTS.MODIFY_RESERVATION,
  sterge: CHAT_INTENTS.CANCEL_RESERVATION,
  anuleaza: CHAT_INTENTS.CANCEL_RESERVATION,
  tel: CHAT_INTENTS.ADD_PHONE,
  telefon: CHAT_INTENTS.ADD_PHONE,

  // Camere
  "creeaza cam": CHAT_INTENTS.CREATE_ROOM,
  "adauga camera": CHAT_INTENTS.CREATE_ROOM,
  "modifica cam": CHAT_INTENTS.MODIFY_ROOM,
  "problema": CHAT_INTENTS.ROOM_PROBLEM,
  "defect": CHAT_INTENTS.ROOM_PROBLEM,
  "strica": CHAT_INTENTS.ROOM_PROBLEM,

  // Rapoarte și Facturi
  rapoarte: CHAT_INTENTS.SHOW_REPORTS,
  statistici: CHAT_INTENTS.SHOW_REPORTS,
  facturi: CHAT_INTENTS.SHOW_INVOICES,
  factura: CHAT_INTENTS.SHOW_ROOM_INVOICE,

  // POS și Vânzări
  pos: CHAT_INTENTS.SHOW_POS,
  vinde: CHAT_INTENTS.SELL_PRODUCT,
  adauga: CHAT_INTENTS.SELL_PRODUCT,

  // Altele
  calendar: CHAT_INTENTS.SHOW_CALENDAR,
  stock: CHAT_INTENTS.SHOW_STOCK,
  inventar: CHAT_INTENTS.SHOW_STOCK
};

// Pattern-uri specifice pentru intenții
const intentPatterns = {
  [CHAT_INTENTS.RESERVATION]: [
    /rezervare/i,
    /rezerva/i,
    /twin/i,
    /single/i,
    /double/i,
    /camera/i
  ],
  [CHAT_INTENTS.MODIFY_RESERVATION]: [
    /modifica/i,
    /schimba/i,
    /rezervare/i
  ],
  [CHAT_INTENTS.CANCEL_RESERVATION]: [
    /sterge/i,
    /anuleaza/i,
    /rezervare/i
  ],
  [CHAT_INTENTS.ADD_PHONE]: [
    /tel/i,
    /telefon/i,
    /numar/i
  ],
  [CHAT_INTENTS.CREATE_ROOM]: [
    /creeaza/i,
    /adauga/i,
    /camera/i
  ],
  [CHAT_INTENTS.MODIFY_ROOM]: [
    /modifica/i,
    /camera/i
  ],
  [CHAT_INTENTS.ROOM_PROBLEM]: [
    /problema/i,
    /defect/i,
    /strica/i,
    /camera/i
  ],
  [CHAT_INTENTS.SHOW_REPORTS]: [
    /rapoarte/i,
    /statistici/i
  ],
  [CHAT_INTENTS.SHOW_INVOICES]: [
    /facturi/i,
    /factura/i
  ],
  [CHAT_INTENTS.SHOW_ROOM_INVOICE]: [
    /factura/i,
    /camera/i
  ],
  [CHAT_INTENTS.SHOW_POS]: [
    /pos/i,
    /vanzare/i
  ],
  [CHAT_INTENTS.SELL_PRODUCT]: [
    /vinde/i,
    /adauga/i,
    /produs/i
  ],
  [CHAT_INTENTS.SHOW_CALENDAR]: [
    /calendar/i
  ],
  [CHAT_INTENTS.SHOW_STOCK]: [
    /stock/i,
    /inventar/i
  ]
};

module.exports = {
  quickRoute,
  intentPatterns
}; 