const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const {
  sendDefaultResponse
} = require('../utils/uiResponder');

/**
 * Handler pentru intenții nerecunoscute sau când nu există un handler specific
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleDefaultIntent = (entities, sendResponse) => {
  console.log('❓ Handler default/necunoscut apelat.');
  
  // Trimitem răspunsul default prin callback centralizat
  sendDefaultResponse(sendResponse);
};

module.exports = {
  handleDefaultIntent
}; 