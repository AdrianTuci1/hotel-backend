const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');
const { handleMessage } = require('../controllers/chatController');

/**
 * Distribuitor central pentru acțiuni primite prin socket
 */

// Procesează mesajele primite și le direcționează către handler-ul corespunzător
const processMessage = async (ws, message) => {
  try {
    console.log("📩 Procesare mesaj primit:", message);
    const parsedMessage = JSON.parse(message);

    // Verificăm dacă mesajul are un tip valid
    if (!parsedMessage.type) {
      throw new Error("Mesajul nu conține un tip valid");
    }

    // Direcționăm mesajul către handler-ul corespunzător
    if (parsedMessage.type === "CHAT_MESSAGE") {
      await handleMessage(ws, parsedMessage.content);
    } else {
      throw new Error(`Tip de mesaj necunoscut: ${parsedMessage.type}`);
    }
  } catch (error) {
    console.error("❌ Eroare la procesarea mesajului:", error);
    
    // Verificăm dacă eroarea este de tip JSON parsing
    if (error instanceof SyntaxError) {
      ws.send(JSON.stringify({
        type: OUTGOING_MESSAGE_TYPES.ERROR,
        message: "Format JSON invalid pentru mesaj"
      }));
    } else {
      ws.send(JSON.stringify({
        type: OUTGOING_MESSAGE_TYPES.ERROR,
        message: `Eroare la procesarea mesajului: ${error.message}`
      }));
    }
  }
};

module.exports = {
  processMessage
}; 