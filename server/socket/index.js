/**
 * Index centralizat pentru modulul de WebSocket
 * 
 * Acest fișier expune o interfață publică pentru modulul de socket
 * și permite adăugarea ușoară de funcționalități noi.
 */

const WebSocket = require("ws");
const { handleConnection, getClients } = require('./actions/connectionHandler');
const { emitReservationsUpdate } = require('./controllers/reservationController');

// Utils
const messageTypes = require('./utils/messageTypes');

// Inițializează serverul WebSocket
const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("✅ WebSocket server inițializat pentru /api/chat");

  // Configurăm handler pentru noile conexiuni - folosim handleConnection din connectionHandler.js
  wss.on("connection", handleConnection);

  return wss;
};

// Funcție utilitară pentru a notifica toți clienții despre schimbări în rezervări
const notifyReservationChange = async () => {
  await emitReservationsUpdate(getClients());
};

module.exports = {
  // Funcții principale
  initSocket,
  getClients,
  notifyReservationChange,
  
  // Constante
  messageTypes
}; 