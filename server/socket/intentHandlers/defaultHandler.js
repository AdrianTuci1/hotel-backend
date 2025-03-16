const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenții nerecunoscute sau când nu există un handler specific
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleDefaultIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('❓ Handler default apelat cu entități:', entities);
  
  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.DEFAULT,
    type: RESPONSE_TYPES.MESSAGE,
    message: "Îmi pare rău, dar nu am înțeles exact ce doriți să faceți. Vă pot ajuta cu rezervări, vizualizarea calendarului, rapoarte sau stocuri.",
    extraIntents: extraIntents || [],
    reservation: null
  };
  
  // Trimitem răspunsul prin callback
  sendResponse(response);
};

module.exports = {
  handleDefaultIntent
}; 