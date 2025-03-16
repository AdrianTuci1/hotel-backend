const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { handleReservationIntent } = require("./reservationHandler");
const { findReservationByRoomAndDate } = require("./modifyReservationHandler");
const { handleAddPhoneIntent } = require("./phoneHandler");
const { handleCreateRoomIntent, handleModifyRoomIntent } = require("./roomHandler");
const { handleSellProductIntent } = require("./posHandler");
const { handleDefaultIntent } = require("./defaultHandler");
const { 
  handleShowCalendarIntent,
  handleShowStockIntent,
  handleShowReportsIntent,
  handleShowInvoicesIntent,
  handleShowPosIntent
} = require("./uiHandlers");

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
    // Obținem handler-ul corect pentru intent
    const handler = intentHandlers[intent] || handleDefaultIntent;
    
    // Asigurăm că entities și extraIntents sunt obiecte/array-uri valide
    const validEntities = entities || {};
    const validExtraIntents = extraIntents || [];
    
    // Apelăm handler-ul și obținem răspunsul
    let response = await handler(validEntities, validExtraIntents);
    
    // Asigurăm formatul standardizat pentru răspuns
    return {
      intent: response.intent || intent,
      message: response.message || `🔹 Intent: ${intent}`,
      type: response.type,
      reservation: response.reservation,
      extraIntents: response.extraIntents || validExtraIntents,
      // Nu includem entities în răspunsul final conform cerințelor de simplificare
    };
  } catch (error) {
    console.error(`❌ Eroare la procesarea intenției ${intent}:`, error);
    
    // Returnăm un răspuns de eroare formatat
    return {
      intent,
      type: RESPONSE_TYPES.ERROR,
      message: `❌ Eroare la procesarea intenției: ${error.message}`,
      extraIntents,
      reservation: null
    };
  }
};

module.exports = {
  processIntent,
  intentHandlers
}; 