const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");
const {
  sendOpenModifyReservationOverlay,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Găsește o rezervare existentă pentru o anumită cameră și dată (pentru a o deschide)
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const findReservationByRoomAndDate = async (entities, sendResponse) => {
  console.log('🔍 Căutare rezervare existentă cu entități:', entities);
  
  // Extragem corect numărul camerei - poate fi direct string sau obiect cu proprietatea value
  const roomNumber = typeof entities.roomNumber === 'object' && entities.roomNumber.value 
    ? entities.roomNumber.value 
    : entities.roomNumber;
    
  // Extragem data de început - poate fi direct în entități sau în array-ul dates
  let date = null;
  
  // Verificăm dacă avem data direct în entități
  if (entities.startDate) {
    date = typeof entities.startDate === 'object' ? entities.startDate.value : entities.startDate;
  }
  
  // Verificăm dacă avem data în formatul dates array
  if (!date && entities.dates && entities.dates.length > 0 && entities.dates[0].startDate) {
    date = typeof entities.dates[0].startDate === 'object' 
      ? entities.dates[0].startDate.value 
      : entities.dates[0].startDate;
  }
  
  // Verificăm dacă avem numărul camerei
  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, "Te rog să specifici numărul camerei pentru a găsi rezervarea.");
    return;
  }

  // Verificăm dacă avem o dată
  if (!date) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, "Te rog să specifici data pentru a găsi rezervarea.");
    return;
  }

  try {
    console.log(`🔍 Căutare rezervare pentru camera ${roomNumber} la data ${date}`);
    
    // Căutăm rezervarea în baza de date
    const reservation = await getReservationByRoomAndDate(roomNumber, date);

    if (reservation) {
      console.log(`✅ Rezervare găsită pentru camera ${roomNumber}:`, 
        reservation.id ? `ID: ${reservation.id}` : 'ATENȚIE: ID-ul rezervării lipsește!');
      
      // Verificăm că avem un ID valid pentru rezervare
      if (!reservation.id) {
        sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`);
        return;
      }
      
      const reservationData = {
          id: reservation.id,
          roomNumber: roomNumber, // Use the extracted roomNumber
          startDate: reservation.startDate,
          endDate: reservation.endDate
      };
      // Am găsit rezervarea cu ID valid - construim răspunsul pentru deschiderea rezervării existente
      sendOpenModifyReservationOverlay(sendResponse, reservationData);
    } else {
      // Nu am găsit rezervarea - trimitem un mesaj de eroare
      sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}.`);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea rezervării:", error);
    // Eroare la căutarea în baza de date - trimitem un mesaj de eroare
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_RESERVATION, `A apărut o eroare la căutarea rezervării: ${error.message}`);
  }
};

module.exports = {
  findReservationByRoomAndDate
}; 