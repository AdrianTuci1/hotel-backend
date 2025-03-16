const { analyzeMessage } = require("../../nlp/nlpService");
const { processIntent } = require("../intentHandlers");
const { RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Service pentru procesarea mesajelor de chat
 */

// Procesează un mesaj de chat și returnează un răspuns adecvat
const processMessage = async (message) => {
  try {
    console.log("📩 Procesare mesaj:", message);
    const { intent, entities, extraIntents } = await analyzeMessage(message);

    // Delegăm procesarea către handler-ul corespunzător
    const response = await processIntent(intent, entities, extraIntents);
    
    return response;
  } catch (error) {
    console.error("❌ Eroare la procesarea mesajului de chat:", error);
    return {
      type: RESPONSE_TYPES.ERROR,
      message: "A apărut o eroare la procesarea mesajului. Vă rugăm încercați din nou."
    };
  }
};

module.exports = {
  processMessage
}; 