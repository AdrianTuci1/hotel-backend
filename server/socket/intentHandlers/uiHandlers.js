const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de afișare a calendarului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleShowCalendarIntent = (entities, extraIntents = []) => {
  return {
    intent: CHAT_INTENTS.SHOW_CALENDAR,
    type: RESPONSE_TYPES.ACTION,
    action: "show_calendar",
    message: "📅 Se deschide calendarul rezervărilor...",
    entities,
    extraIntents: extraIntents || [],
  };
};

/**
 * Handler pentru intenția de afișare a stocului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleShowStockIntent = (entities, extraIntents = []) => {
  return {
    intent: CHAT_INTENTS.SHOW_STOCK,
    type: RESPONSE_TYPES.ACTION,
    action: "show_stock",
    message: "📦 Se deschide modulul de gestiune a stocurilor...",
    entities,
    extraIntents: extraIntents || [],
  };
};

/**
 * Handler pentru intenția de afișare a rapoartelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleShowReportsIntent = (entities, extraIntents = []) => {
  return {
    intent: CHAT_INTENTS.SHOW_REPORTS,
    type: RESPONSE_TYPES.ACTION,
    action: "show_reports",
    message: "📊 Se generează rapoartele solicitate...",
    entities,
    extraIntents: extraIntents || [],
  };
};

/**
 * Handler pentru intenția de afișare a facturilor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleShowInvoicesIntent = (entities, extraIntents = []) => {
  return {
    intent: CHAT_INTENTS.SHOW_INVOICES,
    type: RESPONSE_TYPES.ACTION,
    action: "show_invoices",
    message: "📄 Se afișează lista de facturi...",
    entities,
    extraIntents: extraIntents || [],
  };
};


/**
 * Handler pentru intenția de afișare a POS-ului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleShowPosIntent = (entities, extraIntents = []) => {
  return {
    intent: CHAT_INTENTS.SHOW_POS,
    type: RESPONSE_TYPES.ACTION,
    action: "show_pos", 
    message: "🛒 Se deschide modulul de vânzare a produselor...",
    entities,
    extraIntents: extraIntents || [],
  };
};



module.exports = {
  handleShowCalendarIntent,
  handleShowStockIntent,
  handleShowReportsIntent,
  handleShowInvoicesIntent,
  handleShowPosIntent
}; 