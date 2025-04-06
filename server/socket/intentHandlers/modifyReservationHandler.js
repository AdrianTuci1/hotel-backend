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
  if (!date) {
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_RESERVATION,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici data pentru a găsi rezervarea.",
      extraIntents: extraIntents || [],
      reservation: null
    });
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
        sendResponse({
          intent: CHAT_INTENTS.MODIFY_RESERVATION,
          type: RESPONSE_TYPES.ERROR,
          message: `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`,
          extraIntents: extraIntents || [],
          reservation: null
        });
        return;
      }
      
      // Am găsit rezervarea cu ID valid - construim răspunsul pentru deschiderea rezervării existente
      sendResponse({
        intent: CHAT_INTENTS.MODIFY_RESERVATION,
        type: RESPONSE_TYPES.INFO,
        message: `Am găsit rezervarea #${reservation.id} pentru camera ${roomNumber}. Se deschide formularul pentru modificare.`,
        reservation: {
          id: reservation.id,
          roomNumber: roomNumber,
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