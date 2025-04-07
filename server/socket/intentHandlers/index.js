const { CHAT_INTENTS } = require("../utils/messageTypes");
const { handleShowCalendarIntent, handleShowStockIntent, handleShowReportsIntent, handleShowInvoicesIntent, handleShowPosIntent } = require("./uiHandlers");
const { handleReservationIntent } = require("./reservationHandler");
const { findReservationByRoomAndDate } = require("./modifyReservationHandler");
const { handleAddPhoneIntent } = require("./phoneHandler");
const { handleCreateRoomIntent, handleModifyRoomIntent, handleDeleteRoomIntent } = require("./roomHandler");
const { handleSellProductIntent } = require("./posHandler");
const { handleDefaultIntent } = require("./defaultHandler");
const { handleRoomProblemIntent } = require ("./problemHandler")

/**
 * Map de handlere pentru fiecare intenție
 */
const intentHandlers = {
  // Intenții de chat (UI Actions)
  [CHAT_INTENTS.SHOW_CALENDAR]: handleShowCalendarIntent,
  [CHAT_INTENTS.SHOW_STOCK]: handleShowStockIntent,
  [CHAT_INTENTS.SHOW_REPORTS]: handleShowReportsIntent,
  [CHAT_INTENTS.SHOW_INVOICES]: handleShowInvoicesIntent,
  [CHAT_INTENTS.SHOW_POS]: handleShowPosIntent,
  
  // Rezervări & POS (Info Responses -> Overlays/Forms)
  [CHAT_INTENTS.RESERVATION]: handleReservationIntent,
  [CHAT_INTENTS.MODIFY_RESERVATION]: findReservationByRoomAndDate,
  [CHAT_INTENTS.SELL_PRODUCT]: handleSellProductIntent,
  
  // Camere (Info/Confirmation Responses -> Overlays/Forms/Confirmations)
  [CHAT_INTENTS.CREATE_ROOM]: handleCreateRoomIntent,
  [CHAT_INTENTS.MODIFY_ROOM]: handleModifyRoomIntent,
  [CHAT_INTENTS.DELETE_ROOM]: handleDeleteRoomIntent,
  [CHAT_INTENTS.ROOM_PROBLEM]: handleRoomProblemIntent,
  
  // Phone (Confirmation Response)
  [CHAT_INTENTS.ADD_PHONE]: handleAddPhoneIntent,

  // Default / Fallback
  [CHAT_INTENTS.DEFAULT]: handleDefaultIntent,
  [CHAT_INTENTS.UNKNOWN]: handleDefaultIntent
};

/**
 * Returnează handlerul pentru o anumită intenție
 * @param {string} intent - Intenția pentru care se caută handlerul
 * @returns {Function|null} - Handlerul pentru intenția specificată sau null dacă nu există
 */
const getIntentHandler = (intent) => {
  // Return the handler function directly
  return intentHandlers[intent] || intentHandlers[CHAT_INTENTS.DEFAULT];
};

module.exports = {
  getIntentHandler
}; 