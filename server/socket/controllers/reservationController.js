const {
  getActiveReservations,
  sendReservationsUpdateMessage
} = require('../services/reservationService');
const { OUTGOING_MESSAGE_TYPES, NOTIFICATION_TYPES } = require('../utils/messageTypes');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller pentru manipularea acțiunilor rezervărilor (appointments)
 * și distribuirea datelor despre appointments prin WebSocket
 */

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

// Trimite toate rezervările (appointments) active către un client specific
const sendActiveReservationsToClient = async (ws) => {
  try {
    console.log("📤 Trimitere appointments active către client");
    const activeAppointments = await getActiveReservations();
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.APPOINTMENTS,
      data: {
        appointments: activeAppointments,
        action: 'init'
      }
    }));
  } catch (error) {
    console.error("❌ Eroare la trimiterea appointments active:", error);
    const errorMessage = formatErrorHistory(
      "Eroare Date",
      "A apărut o eroare la obținerea listei de appointments active"
    );
    ws.send(JSON.stringify(errorMessage));
  }
};

// Emite un update cu appointments active către toți clienții conectați
const emitReservationsUpdate = async (clients) => {
  if (!clients || clients.size === 0) return;
  try {
    console.log("🔄 Emitere update appointments către toți clienții");
    const activeAppointments = await getActiveReservations();
    const message = JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.APPOINTMENTS,
      data: {
        appointments: activeAppointments,
        action: 'update'
      }
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error("❌ Eroare la emiterea update-ului de appointments:", error);
    const errorMessage = formatErrorHistory(
      "Eroare Sincronizare",
      "A apărut o eroare la actualizarea listei de appointments"
    );
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(errorMessage));
      }
    });
  }
};

module.exports = {
  sendActiveReservationsToClient,
  emitReservationsUpdate
}; 