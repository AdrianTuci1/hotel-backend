const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");

/**
 * Găsește o rezervare existentă pentru o anumită cameră și dată (pentru a o deschide)
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const findReservationByRoomAndDate = async (entities, extraIntents = [], sendResponse) => {
  console.log('🔍 Căutare rezervare existentă cu entități:', entities);
  
  // Verificăm dacă avem numărul camerei
  if (!entities.roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_RESERVATION,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei pentru a găsi rezervarea.",
      extraIntents: extraIntents || [],
      reservation: null
    });
    return;
  }

  // Verificăm dacă avem o dată
  if (!entities.startDate) {
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_RESERVATION,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici data pentru a găsi rezervarea.",
      extraIntents: extraIntents || [],
      reservation: null
    });
    return;
  }

  const roomNumber = entities.roomNumber.value;
  const date = entities.startDate?.value;

  try {
    // Căutăm rezervarea în baza de date
    const reservation = await getReservationByRoomAndDate(roomNumber, date);

    if (reservation) {
      // Am găsit rezervarea - construim răspunsul pentru deschiderea rezervării existente
      sendResponse({
        intent: CHAT_INTENTS.MODIFY_RESERVATION,
        type: RESPONSE_TYPES.ACTION,
        message: `Am găsit rezervarea pentru camera ${roomNumber}. Se deschide formularul pentru modificare.`,
        reservation: {
          id: reservation.id,
          startDate: reservation.startDate,
          endDate: reservation.endDate
        },
        extraIntents: extraIntents || []
      });
    } else {
      // Nu am găsit rezervarea - trimitem un mesaj de eroare
      sendResponse({
        intent: CHAT_INTENTS.MODIFY_RESERVATION,
        type: RESPONSE_TYPES.ERROR,
        message: `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}.`,
        extraIntents: extraIntents || [],
        reservation: null
      });
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea rezervării:", error);
    // Eroare la căutarea în baza de date - trimitem un mesaj de eroare
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_RESERVATION,
      type: RESPONSE_TYPES.ERROR,
      message: `A apărut o eroare la căutarea rezervării: ${error.message}`,
      extraIntents: extraIntents || [],
      reservation: null
    });
  }
};

module.exports = {
  findReservationByRoomAndDate
}; 