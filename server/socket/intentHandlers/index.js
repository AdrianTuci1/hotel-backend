const { CHAT_INTENTS } = require("../utils/messageTypes");
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

  // Intenții de chat
  [CHAT_INTENTS.SHOW_CALENDAR]: handleShowCalendarIntent, //TYPE: RESPONSE_TYPES.ACTION
  [CHAT_INTENTS.SHOW_STOCK]: handleShowStockIntent, //TYPE: RESPONSE_TYPES.ACTION
  [CHAT_INTENTS.SHOW_REPORTS]: handleShowReportsIntent, //TYPE: RESPONSE_TYPES.ACTION 
  [CHAT_INTENTS.SHOW_INVOICES]: handleShowInvoicesIntent, //TYPE: RESPONSE_TYPES.ACTION
  [CHAT_INTENTS.SHOW_POS]: handleShowPosIntent, //TYPE: RESPONSE_TYPES.ACTION
  
  // Rezervări
  [CHAT_INTENTS.RESERVATION]: handleReservationIntent, //TYPE: RESPONSE_TYPES.INFO  
  [CHAT_INTENTS.MODIFY_RESERVATION]: findReservationByRoomAndDate, //TYPE: RESPONSE_TYPES.INFO
  [CHAT_INTENTS.ADD_PHONE]: handleAddPhoneIntent, //TYPE: RESPONSE_TYPES.CONFIRM
  // Camere
  [CHAT_INTENTS.CREATE_ROOM]: handleCreateRoomIntent, //TYPE: RESPONSE_TYPES.ROOM
  [CHAT_INTENTS.MODIFY_ROOM]: handleModifyRoomIntent, //TYPE: RESPONSE_TYPES.ROOM
  
  // POS și Stoc
  [CHAT_INTENTS.SELL_PRODUCT]: handleSellProductIntent, //TYPE: RESPONSE_TYPES.POS
  
  // Intenție implicită pentru cazurile necunoscute
  [CHAT_INTENTS.DEFAULT]: handleDefaultIntent, //TYPE: RESPONSE_TYPES.ACTION
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