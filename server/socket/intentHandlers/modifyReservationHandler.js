const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const Reservation = require("../../models/Reservation");
const { Op } = require("sequelize");

/**
 * Funcție utilitară internă pentru a găsi o rezervare după numărul camerei și dată
 * @param {number} roomNumber - Numărul camerei
 * @param {string|Date} date - Data pentru care căutăm rezervarea
 * @returns {Promise<Object|null>} - Rezervarea găsită sau null
 * @private
 */
const _findReservationByRoomAndDate = async (roomNumber, date) => {
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
 * Găsește o rezervare după numărul camerei și data și returnează un răspuns formatat
 * Această funcție este folosită doar pentru a deschide o rezervare existentă
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const findReservationByRoomAndDate = async (entities = {}, extraIntents = []) => {
  // Intent-ul este mereu MODIFY_RESERVATION
  const intent = CHAT_INTENTS.MODIFY_RESERVATION;
  
  // Pregătim array-ul de extraIntents
  const finalExtraIntents = extraIntents || ["show_calendar"];
  
  // Verificăm dacă avem numărul camerei și data necesare
  if (!entities.roomNumber || (!entities.date && !entities.startDate)) {
    // Nu avem suficiente informații pentru a căuta o rezervare
    return {
      intent,
      type: RESPONSE_TYPES.FORM,
      message: "Pentru a deschide o rezervare, vă rog să specificați numărul camerei și data.",
      extraIntents: finalExtraIntents,
      reservation: null
    };
  }
  
  try {
    const roomNumber = parseInt(entities.roomNumber);
    const date = entities.date || entities.startDate;
    
    // Folosim funcția utilitară internă pentru a găsi rezervarea
    const reservation = await _findReservationByRoomAndDate(roomNumber, date);
    
    if (!reservation) {
      // Rezervare negăsită
      return {
        intent,
        type: RESPONSE_TYPES.ERROR,
        message: `Nu am găsit nicio rezervare pentru camera ${roomNumber} la data ${date}.`,
        extraIntents: finalExtraIntents,
        reservation: null
      };
    }
    
    // Rezervare găsită - pregătim răspunsul simplu
    return {
      intent,
      type: RESPONSE_TYPES.FORM,
      message: `📅 Am găsit rezervarea pentru camera ${roomNumber} în perioada ${reservation.startDate} - ${reservation.endDate}.`,
      reservation: {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate
      },
      extraIntents: finalExtraIntents
    };
  } catch (error) {
    console.error("❌ Eroare la găsirea rezervării:", error);
    return {
      intent,
      type: RESPONSE_TYPES.ERROR,
      message: "A apărut o problemă la căutarea rezervării.",
      extraIntents: finalExtraIntents,
      reservation: null
    };
  }
};

module.exports = {
  findReservationByRoomAndDate
}; 