const WebSocket = require('ws');
const { Reservation } = require('../../models');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');

/**
 * Service pentru manipularea și distribuirea informațiilor despre rezervări
 * prin WebSocket către clienți conectați
 */

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
  
  
  // 🔥 Obține toate rezervările active din baza de date
  const getActiveReservations = async () => {
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
  
      return activeReservations.map(formatReservation);
    } catch (error) {
      console.error("❌ Eroare la obținerea rezervărilor active:", error);
      throw error;
    }
  };
  
  // 🔥 Funcție care trimite mesajul de actualizare despre rezervări către clienți
  const sendReservationsUpdateMessage = (clients, reservations, action = 'sync') => {
    const message = JSON.stringify({ 
      type: OUTGOING_MESSAGE_TYPES.RESERVATIONS_UPDATE,
      action: action,  // 'sync' pentru sincronizare completă, 'init' pentru inițializare
      reservations: reservations 
    });
  
    if (Array.isArray(clients)) {
      // Trimite la mai mulți clienți
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else if (clients && clients.readyState === WebSocket.OPEN) {
      // Trimite la un singur client
      clients.send(message);
    }
  };

  module.exports = {
    formatReservation,
    getActiveReservations,
    emitReservationsUpdate,
    sendReservationsUpdateMessage
  }