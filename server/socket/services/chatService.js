const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { analyzeMessage } = require("../../nlp/core/nlpService");
const { getIntentHandler } = require("../intentHandlers");

/**
 * Procesează un mesaj de chat și returnează răspunsul potrivit
 * Acum, în loc să returneze direct răspunsul, va apela handlerul care va gestiona trimiterea
 * 
 * @param {string} message - Mesajul de procesat
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const processIntent = async (message, sendResponse) => {
  console.log(`🔍 Procesare mesaj: "${message}"`);
  
  try {
    // Apelăm serviciul NLP pentru a obține intenția și entitățile
    const result = await analyzeMessage(message);
    const { intent, entities, extraIntents } = result;
    
    console.log(`📋 Intent detectat: ${intent}, entități:`, entities);
    
    // Verificăm dacă avem un handler pentru intenția detectată
    const handler = getIntentHandler(intent);
    
    if (!handler) {
      console.warn(`⚠️ Nu există handler pentru intenția: ${intent}`);
      // Trimitem un răspuns de eroare
      sendResponse({
        intent: CHAT_INTENTS.DEFAULT,
        type: RESPONSE_TYPES.ERROR,
        message: "Nu pot procesa acest tip de cerere momentan.",
        extraIntents: [],
        reservation: null
      });
      return;
    }
    
    console.log(`🚀 Executare handler pentru intenția: ${intent}`);
    
    // Validăm entitățile și extraIntents pentru a evita erori
    const validEntities = entities || {};
    const validExtraIntents = Array.isArray(extraIntents) ? extraIntents : [];
    
    // Apelăm handlerul cu entitățile, extraIntents și callback-ul pentru răspuns
    // Handlerul va apela sendResponse când va fi gata
    await handler(validEntities, validExtraIntents, sendResponse);
    
  } catch (error) {
    console.error(`❌ Eroare la procesarea intenției: ${error.message}`, error);
    // Trimitem un răspuns de eroare
    sendResponse({
      intent: CHAT_INTENTS.DEFAULT,
      type: RESPONSE_TYPES.ERROR,
      message: "A apărut o eroare la procesarea comenzii. Vă rog să încercați din nou.",
      extraIntents: [],
      reservation: null
    });
  }
};

module.exports = {
  processIntent
}; 