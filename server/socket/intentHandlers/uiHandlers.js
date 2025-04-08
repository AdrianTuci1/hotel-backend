const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const {
  sendShowCalendar,
  sendShowStock,
  sendShowReports,
  sendShowInvoices,
  sendShowPos,
} = require('../utils/uiResponder');

/**
 * Handler pentru intenția de afișare a calendarului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowCalendarIntent = (entities, sendResponse) => {
  console.log('🗓️ Handler calendar apelat cu entități:', entities);
  sendShowCalendar(sendResponse);
};

/**
 * Handler pentru intenția de afișare a stocului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowStockIntent = (entities, sendResponse) => {
  console.log('📦 Handler stoc apelat cu entități:', entities);
  sendShowStock(sendResponse);
};

/**
 * Handler pentru intenția de afișare a rapoartelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowReportsIntent = (entities, sendResponse) => {
  console.log('📊 Handler rapoarte apelat cu entități:', entities);
  sendShowReports(sendResponse);
};

/**
 * Handler pentru intenția de afișare a facturilor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowInvoicesIntent = (entities, sendResponse) => {
  console.log('📄 Handler facturi apelat cu entități:', entities);
  sendShowInvoices(sendResponse);
};

/**
 * Handler pentru intenția de afișare a POS-ului
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleShowPosIntent = (entities, sendResponse) => {
  console.log('🛒 Handler POS apelat cu entități:', entities);
  sendShowPos(sendResponse);
};

module.exports = {
  handleShowCalendarIntent,
  handleShowStockIntent,
  handleShowReportsIntent,
  handleShowInvoicesIntent,
  handleShowPosIntent
}; 