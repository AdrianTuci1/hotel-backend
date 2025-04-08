const { processMessage } = require('./actionHandler');
const { sendActiveReservationsToClient } = require('../controllers/reservationController');
const { setupAutomationChecks } = require('../controllers/automationController');
const { broadcastHistoryUpdate, getHistory } = require('../services/historyService');
const { OUTGOING_MESSAGE_TYPES, NOTIFICATION_TYPES } = require('../utils/messageTypes');
const { v4: uuidv4 } = require('uuid');

/**
 * Handler pentru conexiunile WebSocket
 */

// Stochează clienții activi
let clients = new Set();

// Obține setul de clienți activi
const getClients = () => clients;

// Helper to format error notifications as HISTORY items
const formatErrorHistory = (title, message) => {
  return {
    type: OUTGOING_MESSAGE_TYPES.HISTORY,
    data: {
      items: [
        {
          id: uuidv4(),
          entryType: 'notification',
          timestamp: new Date().toISOString(),
          payload: {
            title: title,
            message: message,
            type: NOTIFICATION_TYPES.ERROR
          }
        }
      ]
    }
  };
};

// Gestionează o nouă conexiune WebSocket
const handleConnection = async (ws) => {
  console.log("✅ Client WebSocket conectat.");
  
  // Adăugăm clientul în lista de clienți activi
  clients.add(ws);
  
  // Atașăm funcția getClients la ws pentru a fi accesibilă în diverse handlere
  ws.getClients = getClients;

  // Trimitem appointments active la clientul conectat
  sendActiveReservationsToClient(ws);

  // Trimitem istoricul mesajelor la clientul conectat
  try {
    const historyData = await getHistory({ pageSize: 50 }); // Fetch history data
    const message = JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.HISTORY,
      data: historyData
    });
    ws.send(message);
  } catch (error) {
    console.error('❌ Eroare la trimiterea istoricului:', error);
    // Trimitem notificare de eroare formatată ca HISTORY item
    const errorMessage = formatErrorHistory(
      "Eroare Istoric",
      "Eroare la încărcarea istoricului mesajelor"
    );
    ws.send(JSON.stringify(errorMessage));
  }

  // Configurăm verificările automate pentru acest client
  const intervals = setupAutomationChecks(ws);
  
  // Stocăm intervalele în conexiunea client pentru a putea fi oprite la deconectare
  ws.intervals = intervals;

  // Gestionăm mesajele primite
  ws.on("message", async (message) => {
    await processMessage(ws, message);
  });

  // Gestionăm erorile de conexiune
  ws.on("error", (error) => {
    console.error("❌ Eroare conexiune WebSocket:", error);
    cleanupConnection(ws);
  });

  // Gestionăm deconectarea
  ws.on("close", () => {
    console.log("🔌 Client WebSocket deconectat.");
    cleanupConnection(ws);
  });
};

// Curăță resursele asociate conexiunii la deconectare
const cleanupConnection = (ws) => {
  // Oprim intervalele de automatizare specifice acestui client
  if (ws.intervals) {
    Object.values(ws.intervals).forEach(clearInterval);
    console.log("🛑 Intervale de automatizare oprite pentru clientul deconectat.");
  }
  // Scoatem clientul din lista de clienți activi
  clients.delete(ws);
};

module.exports = {
  handleConnection,
  getClients
}; 