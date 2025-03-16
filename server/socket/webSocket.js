const WebSocket = require("ws");
const { handleChatMessage } = require("./controllers/chatController");
const { sendActiveReservationsToClient, emitReservationsUpdate } = require("./controllers/reservationController");

/**
 * Modul principal WebSocket pentru server
 * Gestionează inițializarea și operațiile globale ale serverului WebSocket
 */

// Stocăm toți clienții conectați
const clients = new Set();

// Inițializează serverul WebSocket
const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("✅ WebSocket server inițializat pentru /api/chat");

  // Configurăm handler pentru noile conexiuni
  wss.on("connection", (ws, request) => {
    console.log("🔌 Client nou conectat");
    
    // Adăugăm clientul în lista de clienți
    clients.add(ws);
    
    // Trimitem rezervările active la conectare
    sendActiveReservationsToClient(ws);
    
    // Configurăm handler pentru mesajele primite
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        
        // Verificăm tipul mesajului
        if (parsedMessage.type === "CHAT_MESSAGE") {
          handleChatMessage(ws, parsedMessage.content);
        }
        // Aici putem adăuga și alte tipuri de mesaje în viitor
      } catch (error) {
        console.error("❌ Eroare la procesarea mesajului:", error);
        ws.send(JSON.stringify({
          type: "ERROR",
          message: "Format mesaj invalid"
        }));
      }
    });
    
    // Configurăm handler pentru deconectare
    ws.on("close", () => {
      console.log("🔌 Client deconectat");
      clients.delete(ws);
    });
    
    // Configurăm handler pentru erori
    ws.on("error", (error) => {
      console.error("❌ Eroare WebSocket:", error);
      clients.delete(ws);
    });
  });

  return wss;
};

// Obține toți clienții conectați
const getClients = () => {
  return clients;
};

// Funcție utilitară pentru a notifica toți clienții despre schimbări în rezervări
const notifyReservationChange = async () => {
  await emitReservationsUpdate(clients);
};

module.exports = { 
  initSocket, 
  getClients, 
  notifyReservationChange 
}; 