const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { handleShowCalendarIntent, handleShowStockIntent, handleShowReportsIntent, handleShowInvoicesIntent, handleShowPosIntent } = require("./uiHandlers");
const { handleReservationIntent } = require("./reservationHandler");
const { findReservationByRoomAndDate } = require("./modifyReservationHandler");
const { handleAddPhoneIntent } = require("./phoneHandler");
const { handleCreateRoomIntent, handleModifyRoomIntent } = require("./roomHandler");
const { handleSellProductIntent } = require("./posHandler");
const { handleDefaultIntent } = require("./defaultHandler");

/**
 * Map de handlere pentru fiecare intenție
 */

const intentHandlers = {
  [CHAT_INTENTS.SHOW_CALENDAR]: handleShowCalendarIntent,
  [CHAT_INTENTS.SHOW_STOCK]: handleShowStockIntent,
  [CHAT_INTENTS.SHOW_REPORTS]: handleShowReportsIntent,
  [CHAT_INTENTS.SHOW_INVOICES]: handleShowInvoicesIntent,
  [CHAT_INTENTS.SHOW_POS]: handleShowPosIntent,
  
  // Rezervări
  [CHAT_INTENTS.RESERVATION]: handleReservationIntent,
  [CHAT_INTENTS.MODIFY_RESERVATION]: findReservationByRoomAndDate,
  [CHAT_INTENTS.ADD_PHONE]: handleAddPhoneIntent,
  // Camere
  [CHAT_INTENTS.CREATE_ROOM]: handleCreateRoomIntent,
  [CHAT_INTENTS.MODIFY_ROOM]: handleModifyRoomIntent,
  
  // POS și Stoc
  [CHAT_INTENTS.SELL_PRODUCT]: handleSellProductIntent,
  
  // Intenție implicită pentru cazurile necunoscute
  [CHAT_INTENTS.DEFAULT]: handleDefaultIntent,
  [CHAT_INTENTS.UNKNOWN]: handleDefaultIntent
};

/**
 * Returnează handlerul pentru o anumită intenție
 * @param {string} intent - Intenția pentru care se caută handlerul
 * @returns {Function|null} - Handlerul pentru intenția specificată sau null dacă nu există
 */
const getIntentHandler = (intent) => {
  return intentHandlers[intent] || handleDefaultIntent;
};

module.exports = {
  getIntentHandler
}; 