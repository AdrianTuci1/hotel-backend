const { INCOMING_MESSAGE_TYPES, OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');
const { handleChatMessage } = require('../controllers/chatController');
const { handleReservationAction } = require('../controllers/reservationController');
const { handleAutomationAction } = require('../controllers/automationController');

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
    switch (parsedMessage.type) {
      case INCOMING_MESSAGE_TYPES.CHAT_MESSAGE:
        await handleChatMessage(ws, parsedMessage.content);
        break;

      case INCOMING_MESSAGE_TYPES.RESERVATION_ACTION:
        if (!parsedMessage.action) {
          throw new Error("Mesajul nu conține o acțiune pentru rezervare");
        }
        await handleReservationAction(ws, parsedMessage.action, parsedMessage.data);
        break;

      case INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION:
        if (!parsedMessage.action) {
          throw new Error("Mesajul nu conține o acțiune pentru automatizare");
        }
        await handleAutomationAction(ws, parsedMessage.action);
        break;

      case INCOMING_MESSAGE_TYPES.ROOM_ACTION:
      case INCOMING_MESSAGE_TYPES.POS_ACTION:
        // Aceste tipuri pot fi implementate în viitor
        ws.send(JSON.stringify({
          type: OUTGOING_MESSAGE_TYPES.ERROR,
          message: `Tipul de acțiune ${parsedMessage.type} nu este implementat încă`
        }));
        break;

      default:
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