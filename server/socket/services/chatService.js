const { CHAT_INTENTS } = require("../utils/messageTypes");
const { analyzeMessage } = require("../../nlp/core/nlpService");
const { getIntentHandler } = require("../intentHandlers");
const { sendDefaultResponse } = require("../utils/uiResponder");
const { extractEntities } = require("../../nlp/entityExtractor");
const { v4: uuidv4 } = require('uuid');

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

const processMessage = async (message, sendResponse) => {
  console.log(`📨 Procesare mesaj: "${message}"`);

  try {
    // 1. Extrage entitățile din mesaj
    const { intent, entities } = await extractEntities(message);
    console.log(`🔍 Intent detectat: ${intent}, Entități:`, entities);

    // 2. Găsește handler-ul potrivit pentru intenție
    const handler = getIntentHandler(intent);

    if (handler) {
      // 3. Apelează handler-ul specific intenției
      console.log(`🚀 Apelare handler pentru intent: ${intent}`);
      await handler(entities, sendResponse);
    } else {
      // 4. Dacă nu există handler, trimite răspunsul default
      console.warn(`🤷‍♂️ Nu s-a găsit handler pentru intent: ${intent}. Trimitere răspuns default.`);
      sendDefaultResponse(sendResponse);
    }
  } catch (error) {
    console.error("❌ Eroare majoră în procesarea mesajului:", error);
    // Trimite un mesaj de eroare general folosind formatul HISTORY
    sendResponse({
      type: OUTGOING_MESSAGE_TYPES.HISTORY,
      data: {
        items: [
          {
            id: uuidv4(),
            entryType: 'message',
            timestamp: new Date().toISOString(),
            payload: {
              intent: CHAT_INTENTS.DEFAULT,
              message: "Oops! A apărut o eroare internă. Vă rugăm să încercați din nou."
            }
          }
        ]
      }
    });
  }
};

module.exports = {
  processIntent,
  processMessage
}; 