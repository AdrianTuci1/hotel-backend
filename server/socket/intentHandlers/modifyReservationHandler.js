const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");
const {
  sendOpenModifyReservationOverlay,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Helper function to extract entity values.
 * @param {Object} entities - The extracted entities object.
 * @returns {Object} An object containing extracted values (roomNumber, date, startDate, endDate).
 */
const getEntityValues = (entities) => ({
    roomNumber: entities.roomNumber?.values[0]?.value,
    date: entities.date?.values[0]?.value, // Specific date to find reservation
    startDate: entities.startDate?.values[0]?.value, // New start date for modification
    endDate: entities.endDate?.values[0]?.value     // New end date for modification
});

/**
 * Găsește o rezervare existentă pentru o anumită cameră și dată (pentru a o deschide)
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const findReservationByRoomAndDate = async (entities, sendResponse) => {
  console.log('🔍 Handler găsire rezervare pentru modificare apelat cu entități:', entities);
  
  const { roomNumber, date, startDate, endDate } = getEntityValues(entities);
  
  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, "Te rog să specifici numărul camerei pentru a găsi rezervarea.");
    return;
  }

  if (!date) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, "Te rog să specifici data pentru a găsi rezervarea.");
    return;
  }

  try {
    console.log(`🔍 Căutare rezervare pentru camera ${roomNumber} la data ${date}`);
    
    // Căutăm rezervarea în baza de date
    const reservation = await getReservationByRoomAndDate(String(roomNumber), date);

    if (reservation) {
      console.log(`✅ Rezervare găsită pentru modificare: ID ${reservation.id}`);
      
      // Verificăm că avem un ID valid pentru rezervare
      if (!reservation.id) {
        console.error('Error: Found reservation object missing ID:', reservation);
        sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`);
        return;
      }
      
      // Prepare data for the overlay
      // Use new dates if provided, otherwise keep existing ones from found reservation
      const overlayData = {
        id: reservation.id,
        roomNumber: reservation.rooms?.[0]?.roomNumber || String(roomNumber), // Get from reservation if possible
        startDate: startDate || reservation.startDate, // Use new start date or existing
        endDate: endDate || reservation.endDate     // Use new end date or existing
      };

      // Am găsit rezervarea cu ID valid - construim răspunsul pentru deschiderea rezervării existente
      sendOpenModifyReservationOverlay(sendResponse, overlayData);
    } else {
      // Nu am găsit rezervarea - trimitem un mesaj de eroare
      console.log(`❌ Nu s-a găsit rezervare pentru camera ${roomNumber} la data ${date}`);
      sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}.`);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea rezervării pentru modificare:", error);
    // Eroare la căutarea în baza de date - trimitem un mesaj de eroare
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `A apărut o eroare la căutarea rezervării: ${error.message}`);
  }
};

module.exports = {
  findReservationByRoomAndDate
}; 