/**
 * Mesaje pentru intenții
 */
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

const intentMessages = {
  [CHAT_INTENTS.UNKNOWN]: "Nu am înțeles comanda. Vă rog să reformulați.",
  [CHAT_INTENTS.RESERVATION]: "✅ Rezervare procesată!",
  [CHAT_INTENTS.MODIFY_RESERVATION]: "✅ Modificare rezervare procesată!",
  [CHAT_INTENTS.CANCEL_RESERVATION]: "✅ Anulare rezervare procesată!",
  [CHAT_INTENTS.ADD_PHONE]: "✅ Adăugare telefon procesată!",
  [CHAT_INTENTS.CREATE_ROOM]: "✅ Creare cameră procesată!",
  [CHAT_INTENTS.MODIFY_ROOM]: "✅ Modificare cameră procesată!",
  [CHAT_INTENTS.ROOM_PROBLEM]: "✅ Problemă cameră procesată!",
  [CHAT_INTENTS.SHOW_REPORTS]: "✅ Afișare rapoarte procesată!",
  [CHAT_INTENTS.SHOW_INVOICES]: "✅ Afișare facturi procesată!",
  [CHAT_INTENTS.SHOW_ROOM_INVOICE]: "✅ Afișare factură cameră procesată!",
  [CHAT_INTENTS.SHOW_POS]: "✅ Afișare POS procesată!",
  [CHAT_INTENTS.SELL_PRODUCT]: "✅ Vânzare produs procesată!",
  [CHAT_INTENTS.SHOW_CALENDAR]: "✅ Afișare calendar procesată!",
  [CHAT_INTENTS.SHOW_STOCK]: "✅ Afișare stoc procesată!"
};

module.exports = intentMessages; 