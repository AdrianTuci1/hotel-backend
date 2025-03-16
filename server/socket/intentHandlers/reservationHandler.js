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

  const { roomNumber, startDate, endDate } = getEntityValues(entities);

  // Procesăm datele și construim răspunsul
  const response = {
    intent: CHAT_INTENTS.RESERVATION,
    type: RESPONSE_TYPES.ACTION,
    message: `Se deschide formularul pentru o rezervare nouă în camera ${roomNumber} de la ${startDate} până la ${endDate}`,
    extraIntents: extraIntents || [],
    reservation: {
      roomNumber,
      startDate,
      endDate
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

  if (!entities.roomNumber) {
    return "Te rog să specifici numărul camerei pentru rezervare.";
  }

  // Verificăm dacă avem cel puțin startDate, sau ambele startDate și endDate
  if (!entities.startDate) {
    return "Te rog să specifici data de început pentru rezervare.";
  }
  
  if (!entities.endDate) {
    return "Te rog să specifici și data de sfârșit pentru rezervare.";
  }

  return null;
};

/**
 * Extrage valorile entităților pentru rezervare
 * @param {Object} entities - Entitățile extrase din mesaj
 * @returns {Object} - Valorile extrase
 */
const getEntityValues = (entities) => {
  const roomNumber = entities.roomNumber?.value;
  const startDate = entities.startDate?.value;
  const endDate = entities.endDate?.value;
  
  return { roomNumber, startDate, endDate };
};

module.exports = {
  handleReservationIntent
}; 