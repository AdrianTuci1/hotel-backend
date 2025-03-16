/**
 * Index centralizat pentru modulul de WebSocket
 * 
 * Acest fișier expune o interfață publică pentru modulul de socket
 * și permite adăugarea ușoară de funcționalități noi.
 */

// Core WebSocket
const { initSocket, getClients, notifyReservationChange } = require('./webSocket');

// Utils
const messageTypes = require('./utils/messageTypes');

module.exports = {
  // Funcții principale
  initSocket,
  getClients,
  notifyReservationChange,
  
  // Constante
  messageTypes
}; 