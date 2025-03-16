const { getAvailableRooms } = require("../../utils/roomUtils");
const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru rezervare nou - deschide formularul pentru o rezervare nouă
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleReservationIntent = (entities, extraIntents = [], sendResponse) => {
  console.log('🏨 Handler rezervare apelat cu entități:', entities);
  
  const missingEntity = checkMissingEntityReservation(entities);
  if (missingEntity) {
    sendResponse({
      intent: CHAT_INTENTS.RESERVATION,
      type: RESPONSE_TYPES.ERROR,
      message: missingEntity,
      extraIntents: extraIntents || [],
      reservation: null
    });
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

  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.RESERVATION,
    type: RESPONSE_TYPES.ACTION,
    message: `Se deschide formularul pentru o rezervare nouă pentru ${fullName} de la ${finalStartDate} până la ${finalEndDate}`,
    extraIntents: extraIntents || [],
    reservation: {
      fullName,
      roomType,
      startDate: finalStartDate,
      endDate: finalEndDate
    }
  };

  // Trimitem răspunsul prin callback
  sendResponse(response);
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

  // Verificam structura pentru nume - poate fi fie string direct sau un obiect cu valoare
  if(!entities.name) {
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
  // Extragem numele, care poate fi fie un string direct, fie un obiect cu o proprietate value
  const fullName = typeof entities.name === 'object' ? entities.name.value : entities.name;
  
  // Extragem tipul de cameră
  const roomType = entities.roomType;
  
  // Extragem datele dacă există
  let startDate = null;
  let endDate = null;
  
  if (entities.dates && entities.dates.length > 0) {
    startDate = entities.dates[0].startDate;
    endDate = entities.dates[0].endDate;
  }
  
  return { startDate, endDate, fullName, roomType };
};

module.exports = {
  handleReservationIntent
}; 