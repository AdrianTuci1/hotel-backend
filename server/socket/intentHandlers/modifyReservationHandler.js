const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const Reservation = require("../../models/Reservation");
const { Op } = require("sequelize");

/**
 * Găsește o rezervare după numărul camerei și data
 * @param {number} roomNumber - Numărul camerei
 * @param {string|Date} date - Data pentru care căutăm rezervarea
 * @returns {Promise<Object|null>} - Rezervarea găsită sau null
 */
const findReservationByRoomAndDate = async (roomNumber, date) => {
  try {
    // Căutăm rezervările care acoperă data specificată
    const reservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"],
        startDate: { [Op.lte]: date },
        endDate: { [Op.gte]: date }
      }
    });

    // Filtrăm rezervările care conțin camera specificată
    const targetReservation = reservations.find(reservation => {
      const rooms = Array.isArray(reservation.rooms) ? reservation.rooms : [];
      return rooms.some(room => room.roomNumber === roomNumber);
    });

    return targetReservation || null;
  } catch (error) {
    console.error("❌ Eroare la găsirea rezervării:", error);
    throw error;
  }
};

/**
 * Handler pentru intenția de modificare a rezervărilor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const handleModifyReservationIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.MODIFY_RESERVATION,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem numărul camerei și data
  if (entities.roomNumber && (entities.date || entities.startDate)) {
    const roomNumber = parseInt(entities.roomNumber);
    const date = entities.date || entities.startDate;
    
    try {
      const reservation = await findReservationByRoomAndDate(roomNumber, date);
      
      if (!reservation) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = `Nu am găsit nicio rezervare pentru camera ${roomNumber} la data ${date}.`;
      } else {
        response = {
          intent: CHAT_INTENTS.MODIFY_RESERVATION,
          type: RESPONSE_TYPES.FORM,
          title: "Modificare rezervare",
          message: `Am găsit rezervarea pentru perioada ${reservation.startDate} - ${reservation.endDate}.`,
          reservation: {
            id: reservation.id,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            guestName: reservation.guestName || "N/A",
            roomNumbers: reservation.rooms.map(r => r.roomNumber).join(", ")
          },
          extraIntents: extraIntents || []
        };
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea rezervării:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la căutarea rezervării.";
    }
  } else {
    response.type = RESPONSE_TYPES.FORM;
    response.title = "Căutare rezervare";
    response.fields = [
      { name: "roomNumber", label: "Număr cameră", type: "number", required: true },
      { name: "date", label: "Data rezervării", type: "date", required: true }
    ];
    response.message = "Pentru a modifica o rezervare, vă rog să completați numărul camerei și data.";
  }

  return response;
};

/**
 * Handler pentru intenția de ștergere a rezervărilor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const handleCancelReservationIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.CANCEL_RESERVATION,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem numărul camerei și data
  if (entities.roomNumber && (entities.date || entities.startDate)) {
    const roomNumber = parseInt(entities.roomNumber);
    const date = entities.date || entities.startDate;
    
    try {
      const reservation = await findReservationByRoomAndDate(roomNumber, date);
      
      if (!reservation) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = `Nu am găsit nicio rezervare pentru camera ${roomNumber} la data ${date}.`;
      } else {
        response = {
          intent: CHAT_INTENTS.CANCEL_RESERVATION,
          type: RESPONSE_TYPES.CONFIRM,
          title: "Anulare rezervare",
          message: `Doriți să anulați rezervarea pentru ${reservation.guestName || "client"} în perioada ${reservation.startDate} - ${reservation.endDate}?`,
          reservation: {
            id: reservation.id,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            guestName: reservation.guestName || "N/A",
            roomNumbers: reservation.rooms.map(r => r.roomNumber).join(", ")
          },
          options: [
            { id: "confirm", title: "Da, anulează", action: "cancel_confirm" },
            { id: "decline", title: "Nu, păstrează", action: "cancel_decline" }
          ],
          extraIntents: extraIntents || []
        };
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea rezervării:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la căutarea rezervării.";
    }
  } else {
    response.type = RESPONSE_TYPES.FORM;
    response.title = "Căutare rezervare pentru anulare";
    response.fields = [
      { name: "roomNumber", label: "Număr cameră", type: "number", required: true },
      { name: "date", label: "Data rezervării", type: "date", required: true }
    ];
    response.message = "Pentru a anula o rezervare, vă rog să completați numărul camerei și data.";
  }

  return response;
};

module.exports = {
  handleModifyReservationIntent,
  handleCancelReservationIntent,
  findReservationByRoomAndDate
}; 