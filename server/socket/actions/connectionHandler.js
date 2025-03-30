const { processMessage } = require('./actionHandler');
const { sendActiveReservationsToClient } = require('../controllers/reservationController');
const { setupAutomationChecks } = require('../controllers/automationController');
const { broadcastHistoryUpdate, getHistory } = require('../services/historyService');

/**
 * Handler pentru conexiunile WebSocket
 */

// Stochează clienții activi
let clients = new Set();

// Obține setul de clienți activi
const getClients = () => clients;

// Gestionează o nouă conexiune WebSocket
const handleConnection = async (ws) => {
  console.log("✅ Client WebSocket conectat.");
  
  // Adăugăm clientul în lista de clienți activi
  clients.add(ws);
  
  // Atașăm funcția getClients la ws pentru a fi accesibilă în diverse handlere
  ws.getClients = getClients;

  // Trimitem rezervările active la clientul conectat
  sendActiveReservationsToClient(ws);

  // Trimitem istoricul mesajelor la clientul conectat
  try {
    const history = await getHistory({ pageSize: 50 }); // Trimitem ultimele 50 de mesaje
    const message = JSON.stringify({
      type: 'history',
      data: history
    });
    ws.send(message);
  } catch (error) {
    console.error('❌ Eroare la trimiterea istoricului:', error);
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
  // Eliminăm clientul din lista de clienți activi
  clients.delete(ws);
  
  // Curățăm intervalele de verificare automată
  if (ws.intervals) {
    const { bookingEmailInterval, whatsAppInterval, priceAnalysisInterval } = ws.intervals;
    clearInterval(bookingEmailInterval);
    clearInterval(whatsAppInterval);
    clearInterval(priceAnalysisInterval);
  }
};

module.exports = {
  handleConnection,
  getClients
}; 