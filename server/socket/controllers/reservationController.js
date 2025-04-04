const {
  getActiveReservations,
  sendReservationsUpdateMessage
} = require('../services/reservationService');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');

/**
 * Controller pentru manipularea acțiunilor rezervărilor
 * și distribuirea datelor despre rezervări prin WebSocket
 */

// Trimite toate rezervările active către un client specific
const sendActiveReservationsToClient = async (ws) => {
  try {
    console.log("📤 Trimitere rezervări active către client");
    const activeReservations = await getActiveReservations();
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.RESERVATION,
      data: {
        reservations: activeReservations,
        action: 'init'
      }
    }));
  } catch (error) {
    console.error("❌ Eroare la trimiterea rezervărilor active:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
      data: {
        message: "A apărut o eroare la obținerea rezervărilor active",
        severity: 'error'
      }
    }));
  }
};

// Emite actualizări de rezervări către toți clienții conectați
const emitReservationsUpdate = async (clients) => {
  try {
    console.log("📡 Emit actualizări rezervări către toți clienții");
    const activeReservations = await getActiveReservations();
    
    for (const client of clients) {
      client.send(JSON.stringify({
        type: OUTGOING_MESSAGE_TYPES.RESERVATION,
        data: {
          reservations: activeReservations,
          action: 'sync'
        }
      }));
    }
  } catch (error) {
    console.error("❌ Eroare la emiterea actualizărilor de rezervări:", error);
    // Trimitem notificare de eroare către toți clienții
    for (const client of clients) {
      client.send(JSON.stringify({
        type: OUTGOING_MESSAGE_TYPES.NOTIFICATION,
        data: {
          message: "A apărut o eroare la sincronizarea rezervărilor",
          severity: 'error'
        }
      }));
    }
  }
};

module.exports = {
  sendActiveReservationsToClient,
  emitReservationsUpdate
}; 