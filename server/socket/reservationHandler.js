const Reservation = require("../models/Reservation");
const { getClients } = require("./webSocket");
const { OUTGOING_MESSAGE_TYPES } = require("./messageTypes");

// 🔥 Formatare rezervare pentru răspuns
const formatReservation = (reservation) => ({
  id: reservation.id,
  fullName: reservation.fullName,
  phone: reservation.phone,
  email: reservation.email,
  startDate: reservation.startDate,
  endDate: reservation.endDate,
  status: reservation.status,
  rooms: reservation.rooms.map(room => ({
    roomNumber: room.roomNumber,
    type: room.type,
    basePrice: room.basePrice,
    price: room.price,
    startDate: room.startDate || reservation.startDate,
    endDate: room.endDate || reservation.endDate,
    status: room.status
  })),
  isPaid: reservation.isPaid,
  hasInvoice: reservation.hasInvoice,
  hasReceipt: reservation.hasReceipt,
  notes: reservation.notes
});

// 🔥 Funcție care trimite rezervările active prin WebSocket
const emitReservationsUpdate = async () => {
  try {
    const activeReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"]
      },
      attributes: [
        "id",
        "fullName",
        "phone",
        "email",
        "startDate",
        "endDate",
        "status",
        "rooms",
        "isPaid",
        "hasInvoice",
        "hasReceipt",
        "notes"
      ]
    });

    const formattedReservations = activeReservations.map(formatReservation);

    console.log("📡 Trimit rezervări actualizate prin WebSocket:", formattedReservations);

    const clients = getClients();
    const message = JSON.stringify({ 
      type: OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
      action: 'sync',  // Indică o sincronizare completă a rezervărilor
      reservations: formattedReservations 
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error("❌ Eroare la trimiterea rezervărilor prin WebSocket:", error);
    throw error;
  }
};

// 🔥 Trimite rezervările active către un singur client la conectare
const sendActiveReservations = async (ws) => {
  try {
    const activeReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"]
      },
      attributes: [
        "id",
        "fullName",
        "phone",
        "email",
        "startDate",
        "endDate",
        "status",
        "rooms",
        "isPaid",
        "hasInvoice",
        "hasReceipt",
        "notes"
      ]
    });

    const formattedReservations = activeReservations.map(formatReservation);

    ws.send(JSON.stringify({ 
      type: OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
      action: 'init',  // Indică inițializarea conexiunii
      reservations: formattedReservations 
    }));
  } catch (error) {
    console.error("❌ Eroare la obținerea rezervărilor active:", error);
    ws.send(JSON.stringify({
      type: OUTGOING_MESSAGE_TYPES.ERROR,
      message: "Eroare la obținerea rezervărilor active"
    }));
  }
};

module.exports = { 
  emitReservationsUpdate, 
  sendActiveReservations,
  formatReservation
};