const { processIntent } = require('../services/chatService');

/**
 * Controller pentru gestionarea mesajelor de chat
 */

/**
 * Gestionează un mesaj primit de la client
 * @param {Object} socket - Socketul clientului
 * @param {string} message - Mesajul trimis de client
 */
const handleMessage = async (socket, message) => {
  console.log(`📩 Mesaj primit de la client: "${message}"`);
  
  try {
    // Definim funcția de trimitere a răspunsului
    const sendResponse = (response) => {
      console.log(`✉️ Trimitere răspuns la client:`, response);
      socket.send(JSON.stringify({ response }));
    };
    
    // Procesăm intenția și trimitem răspunsul prin callback
    await processIntent(message, sendResponse);
  } catch (error) {
    console.error("❌ Eroare în handleMessage:", error);
    // Trimitem un mesaj de eroare
    socket.emit("chat_response", {
      type: "error",
      message: "A apărut o eroare la procesarea mesajului."
    });
  }
};

module.exports = {
  handleMessage
}; 