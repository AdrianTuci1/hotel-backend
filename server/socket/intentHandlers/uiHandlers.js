const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de afișare a calendarului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowCalendarIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('🗓️ Handler calendar apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SHOW_CALENDAR,
    type: RESPONSE_TYPES.ACTION,
    action: "show_calendar",
    message: "📅 Se deschide calendarul rezervărilor...",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

/**
 * Handler pentru intenția de afișare a stocului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowStockIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('📦 Handler stoc apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SHOW_STOCK,
    type: RESPONSE_TYPES.ACTION,
    action: "show_stock",
    message: "📦 Se deschide modulul de gestiune a stocurilor...",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

/**
 * Handler pentru intenția de afișare a rapoartelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowReportsIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('📊 Handler rapoarte apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SHOW_REPORTS,
    type: RESPONSE_TYPES.ACTION,
    action: "show_reports",
    message: "📊 Se generează rapoartele solicitate...",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

/**
 * Handler pentru intenția de afișare a facturilor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowInvoicesIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('📄 Handler facturi apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SHOW_INVOICES,
    type: RESPONSE_TYPES.ACTION,
    action: "show_invoices",
    message: "📄 Se afișează lista de facturi...",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

/**
 * Handler pentru intenția de afișare a POS-ului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowPosIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('🛒 Handler POS apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.SHOW_POS,
    type: RESPONSE_TYPES.ACTION,
    action: "show_pos", 
    message: "🛒 Se deschide modulul de vânzare a produselor...",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

module.exports = {
  handleShowCalendarIntent,
  handleShowStockIntent,
  handleShowReportsIntent,
  handleShowInvoicesIntent,
  handleShowPosIntent
}; 