const WebSocket = require("ws");
const { handleConnection, getClients } = require("./actions/connectionHandler");
const { emitReservationsUpdate } = require("./controllers/reservationController");

/**
 * Modul principal WebSocket pentru server
 * Gestionează inițializarea și operațiile globale ale serverului WebSocket
 */

// Inițializează serverul WebSocket
const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("✅ WebSocket server inițializat pentru /api/chat");

  // Configurăm handler pentru noile conexiuni
  wss.on("connection", handleConnection);

  return wss;
};

// Funcție utilitară pentru a notifica toți clienții despre schimbări în rezervări
const notifyReservationChange = async () => {
  await emitReservationsUpdate(getClients());
};

module.exports = { 
  initSocket, 
  getClients, 
  notifyReservationChange 
}; 