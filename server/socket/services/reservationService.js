const WebSocket = require('ws');
const { Reservation } = require('../../models');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');
const { Op } = require('sequelize');

/**
 * Service pentru manipularea și distribuirea informațiilor despre appointments (rezervări)
 * prin WebSocket către clienți conectați
 */

// 🔥 Formatare appointment (rezervare) pentru răspuns
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

/**
 * Finds a reservation by room number and date.
 * @param {string} roomNumber The room number.
 * @param {string} date The date (YYYY-MM-DD).
 * @returns {Promise<Object|null>} The formatted reservation or null.
 */
const getReservationByRoomAndDate = async (roomNumber, date) => {
  try {
    const targetDate = new Date(date);
    const reservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"],
        [Op.and]: [
          { startDate: { [Op.lte]: targetDate } },
          { endDate: { [Op.gte]: targetDate } }
        ]
      },
      // Ensure 'rooms' is included if needed for filtering by roomNumber within the array
    });

    if (!reservations || reservations.length === 0) {
      return null;
    }

    // Filter reservations based on the roomNumber within the 'rooms' JSON array
    const targetReservation = reservations.find(reservation => {
      const rooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      return rooms.some(room => room.roomNumber === roomNumber);
    });

    return targetReservation ? formatReservation(targetReservation) : null;
  } catch (error) {
    console.error("❌ Error fetching reservation by room and date:", error);
    throw error;
  }
};

// 🔥 Obține toate appointments (rezervările) active din baza de date
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
    console.error("❌ Eroare la obținerea appointments active:", error);
    throw error;
  }
};

// 🔥 Trimite un mesaj de update cu appointments (rezervări) către clienți specifici
const sendReservationsUpdateMessage = (clients, appointmentsData, action = 'update') => {
  const message = JSON.stringify({
    type: OUTGOING_MESSAGE_TYPES.APPOINTMENTS, // Changed from RESERVATIONS
    data: {
      appointments: appointmentsData, // Renamed from reservations
      action: action
    }
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = {
  formatReservation, // Kept name
  getReservationByRoomAndDate, // Kept name
  getActiveReservations, // Kept name
  sendReservationsUpdateMessage // Kept name
};