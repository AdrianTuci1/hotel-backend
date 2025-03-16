const {
  getActiveReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  addPhoneToReservation
} = require('../services/reservationService');
const { OUTGOING_MESSAGE_TYPES, RESERVATION_ACTIONS } = require('../utils/messageTypes');

/**
 * Controller pentru manipularea acțiunilor rezervărilor
 */

// Trimite toate rezervările active către un client
const sendActiveReservations = async (ws) => {
  try {
    console.log("📤 Trimitere rezervări active către client");
    const activeReservations = await getActiveReservations();
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
      reservations: activeReservations
    }));
  } catch (error) {
    console.error("❌ Eroare la trimiterea rezervărilor active:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: "A apărut o eroare la obținerea rezervărilor active"
    }));
  }
};

// Procesează acțiunile pentru rezervări
const handleReservationAction = async (ws, action, data) => {
  try {
    console.log(`🔄 Procesare acțiune rezervare: ${action}`, data);
    
    let result;
    
    switch (action) {
      case RESERVATION_ACTIONS.CREATE:
        result = await createReservation(data);
        break;
        
      case RESERVATION_ACTIONS.UPDATE:
        if (!data.id) throw new Error("ID-ul rezervării lipsește");
        result = await updateReservation(data.id, data);
        break;
        
      case RESERVATION_ACTIONS.DELETE:
        if (!data.id) throw new Error("ID-ul rezervării lipsește");
        result = await deleteReservation(data.id);
        break;
        
      case RESERVATION_ACTIONS.ADD_PHONE:
        if (!data.id || !data.phone) throw new Error("Date incomplete pentru adăugarea telefonului");
        result = await addPhoneToReservation(data.id, data.phone);
        break;
        
      default:
        throw new Error(`Acțiune rezervare necunoscută: ${action}`);
    }
    
    // Trimitem înapoi rezervările actualizate
    await emitReservationsUpdate(ws.getClients());
    
    return result;
  } catch (error) {
    console.error(`❌ Eroare la procesarea acțiunii rezervare ${action}:`, error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: `Eroare la procesarea acțiunii rezervare: ${error.message}`
    }));
    throw error;
  }
};

// Emite actualizări de rezervări către toți clienții
const emitReservationsUpdate = async (clients) => {
  try {
    console.log("📡 Emit actualizări rezervări către toți clienții");
    const activeReservations = await getActiveReservations();
    
    // Trimitem actualizările la toți clienții conectați
    clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
          reservations: activeReservations
        }));
      }
    });
  } catch (error) {
    console.error("❌ Eroare la emiterea actualizărilor de rezervări:", error);
    // Nu trimitem erori aici pentru a nu întrerupe alte procese
  }
};

module.exports = {
  sendActiveReservations,
  handleReservationAction,
  emitReservationsUpdate
}; 