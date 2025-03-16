const { processMessage } = require('../services/chatService');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');

/**
 * Controller pentru manipularea mesajelor de chat
 */

// Procesează mesajul primit de la client și returnează un răspuns
const handleChatMessage = async (ws, content) => {
  try {
    console.log("💬 Manipulare mesaj chat:", content);
    const response = await processMessage(content);
    
    ws.send(JSON.stringify({ 
      type: OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE, 
      response 
    }));
  } catch (error) {
    console.error("❌ Eroare la manipularea mesajului de chat:", error);
    ws.send(JSON.stringify({ 
      type: OUTGOING_MESSAGE_TYPES.ERROR, 
      message: "A apărut o eroare la procesarea mesajului de chat" 
    }));
  }
};

module.exports = {
  handleChatMessage
}; 