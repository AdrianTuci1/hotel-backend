const WebSocket = require('ws');
const { Reservation } = require('../../models');
const { OUTGOING_MESSAGE_TYPES } = require('../utils/messageTypes');
const { Op } = require('sequelize');

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

/**
 * Găsește o rezervare după numărul camerei și dată
 * @param {number|string} roomNumber - Numărul camerei căutate
 * @param {string|Date} date - Data pentru care se caută rezervarea
 * @returns {Promise<Object|null>} - Rezervarea găsită sau null dacă nu există
 */
const getReservationByRoomAndDate = async (roomNumber, date) => {
  try {
    console.log(`🔍 Caută rezervare pentru camera ${roomNumber} la data ${date}`);
    
    // Convertim date la obiect Date dacă este string
    const searchDate = new Date(date);
    
    // Verificăm dacă data este validă
    if (isNaN(searchDate.getTime())) {
      console.error('❌ Data furnizată este invalidă:', date);
      return null;
    }

    // Căutăm rezervări care acoperă data specificată
    const reservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"],
        startDate: { [Op.lte]: searchDate },
        endDate: { [Op.gte]: searchDate }
      }
    });

    // Dacă nu găsim nicio rezervare pentru această perioadă
    if (!reservations || reservations.length === 0) {
      console.log(`❌ Nicio rezervare găsită pentru data ${date}`);
      return null;
    }

    // Căutăm rezervarea care conține camera specificată
    const targetReservation = reservations.find(reservation => {
      const rooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      return rooms.some(room => String(room.roomNumber) === String(roomNumber));
    });

    if (targetReservation) {
      console.log(`✅ Rezervare găsită pentru camera ${roomNumber} la data ${date}:`, targetReservation.id);
      return formatReservation(targetReservation);
    } else {
      console.log(`❌ Nicio rezervare pentru camera ${roomNumber} la data ${date}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Eroare la căutarea rezervării pentru camera ${roomNumber} la data ${date}:`, error);
    return null;
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
    type: OUTGOING_MESSAGE_TYPES.RESERVATIONS,
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
  getReservationByRoomAndDate,
  getActiveReservations,
  sendReservationsUpdateMessage
}