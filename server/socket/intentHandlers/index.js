const { CHAT_INTENTS } = require("../utils/messageTypes");
const { handleReservationIntent } = require("./reservationHandler");
const { handleModifyReservationIntent, handleCancelReservationIntent } = require("./modifyReservationHandler");
const { handleAddPhoneIntent } = require("./phoneHandler");
const { handleCreateRoomIntent, handleModifyRoomIntent, handleDeleteRoomIntent } = require("./roomHandler");
const { handleSellProductIntent } = require("./posHandler");
const { handleDefaultIntent } = require("./defaultHandler");

/**
 * Map de handlere pentru fiecare intenție
 */

const intentHandlers = {
  
  // Rezervări
  [CHAT_INTENTS.RESERVATION]: handleReservationIntent,
  [CHAT_INTENTS.MODIFY_RESERVATION]: handleModifyReservationIntent,
  [CHAT_INTENTS.CANCEL_RESERVATION]: handleCancelReservationIntent,
  [CHAT_INTENTS.ADD_PHONE]: handleAddPhoneIntent,
  
  // Camere
  [CHAT_INTENTS.CREATE_ROOM]: handleCreateRoomIntent,
  [CHAT_INTENTS.MODIFY_ROOM]: handleModifyRoomIntent,
  [CHAT_INTENTS.DELETE_ROOM]: handleDeleteRoomIntent,
  
  // POS și Stoc
  [CHAT_INTENTS.SELL_PRODUCT]: handleSellProductIntent,
};

/**
 * Procesează o intenție și returnează răspunsul corespunzător
 * @param {string} intent - Intenția detectată
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const processIntent = async (intent, entities, extraIntents = []) => {
  try {
    const handler = intentHandlers[intent] || handleDefaultIntent;
    return await handler(entities, extraIntents);
  } catch (error) {
    console.error(`❌ Eroare la procesarea intenției ${intent}:`, error);
    throw error;
  }
};

module.exports = {
  processIntent,
  intentHandlers
}; 