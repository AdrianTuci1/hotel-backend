const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const {
  sendOpenNewReservationOverlay,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Handler pentru rezervare nou - deschide formularul pentru o rezervare nouă
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleReservationIntent = (entities, sendResponse) => {
  console.log('🏨 Handler rezervare apelat cu entități:', entities);
  
  const missingEntityMessage = checkMissingEntityReservation(entities);
  if (missingEntityMessage) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.RESERVATION, missingEntityMessage);
    return;
  }

  // Extragem valorile entitățlor
  const { startDate, endDate, fullName, roomType } = getEntityValues(entities);

  let finalStartDate = startDate;
  let finalEndDate = endDate;

  // Setăm date implicite dacă nu sunt furnizate
  if (!finalStartDate || !finalEndDate) {
    const today = new Date();
    finalStartDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    finalEndDate = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }

  const reservationData = {
      fullName,
      roomType,
      startDate: finalStartDate,
      endDate: finalEndDate
  };

  // Trimitem răspunsul prin callback centralizat
  sendOpenNewReservationOverlay(sendResponse, reservationData);
};

/**
 * Verifică dacă lipsesc entitățile necesare pentru o rezervare
 * @param {Object} entities - Entitățile extrase din mesaj
 * @returns {String|null} - Mesajul de eroare sau null dacă totul e ok
 */
const checkMissingEntityReservation = (entities) => {
  if (!entities || Object.keys(entities).length === 0) {
    return "Nu am putut identifica detaliile necesare pentru rezervare. Te rog să specifici camera și perioada.";
  }

  // Verificăm dacă avem numele clientului
  if (!entities.fullName) {
    return "Te rog să specifici numele clientului pentru rezervare.";
  }

  return null;
};

/**
 * Extrage valorile entităților pentru rezervare
 * @param {Object} entities - Entitățile extrase din mesaj
 * @returns {Object} - Valorile extrase
 */
const getEntityValues = (entities) => {
  // Extragem numele, care poate fi fie string direct, fie un obiect cu o proprietate value
  const fullName = typeof entities.fullName === 'object' ? entities.fullName.value : entities.fullName;
  
  // Extragem tipul de cameră
  const roomType = typeof entities.roomType === 'object' ? entities.roomType.value : entities.roomType;
  
  // Extragem datele dacă există
  let startDate = null;
  let endDate = null;
  
  // Verificăm dacă avem date direct în entități
  if (entities.startDate) {
    startDate = typeof entities.startDate === 'object' ? entities.startDate.value : entities.startDate;
  }
  
  if (entities.endDate) {
    endDate = typeof entities.endDate === 'object' ? entities.endDate.value : entities.endDate;
  }
  
  // Verificăm dacă avem date în formatul dates array
  if ((!startDate || !endDate) && entities.dates && entities.dates.length > 0) {
    if (!startDate && entities.dates[0].startDate) {
      startDate = typeof entities.dates[0].startDate === 'object' 
        ? entities.dates[0].startDate.value 
        : entities.dates[0].startDate;
    }
    
    if (!endDate && entities.dates[0].endDate) {
      endDate = typeof entities.dates[0].endDate === 'object' 
        ? entities.dates[0].endDate.value 
        : entities.dates[0].endDate;
    }
  }
  
  return { startDate, endDate, fullName, roomType };
};

module.exports = {
  handleReservationIntent
}; 