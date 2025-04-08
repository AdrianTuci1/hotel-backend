const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const {
  sendOpenNewReservationOverlay,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Helper function to check if essential reservation entities are present.
 * @param {Object} entities - The extracted entities.
 * @returns {string | null} An error message if entities are missing, null otherwise.
 */
const checkMissingEntityReservation = (entities) => {
    // Example check: Maybe require at least a date or a name?
    // Adapt this logic based on minimum requirements to open the overlay.
    // if (!entities.startDate && !entities.fullName) {
    //     return "Te rog să specifici cel puțin o dată sau un nume pentru rezervare.";
    // }
    return null; // No essential entities missing for just opening the overlay
};

/**
 * Helper function to extract entity values.
 * @param {Object} entities - The extracted entities object.
 * @returns {Object} An object containing extracted values (startDate, endDate, fullName, roomType).
 */
const getEntityValues = (entities) => ({
    startDate: entities.startDate?.values[0]?.value,
    endDate: entities.endDate?.values[0]?.value,
    fullName: entities.fullName?.values[0]?.value,
    roomType: entities.roomType?.values[0]?.value
});

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

  // Setăm date implicite dacă nu sunt furnizate (optional, maybe handle on client?)
  // if (!finalStartDate && !finalEndDate) {
  //   const today = new Date();
  //   finalStartDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
  //   const tomorrow = new Date();
  //   tomorrow.setDate(today.getDate() + 1);
  //   finalEndDate = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD
  // }

  const reservationData = {
      fullName: fullName || null, // Ensure null if undefined
      roomType: roomType || null, // Ensure null if undefined
      startDate: finalStartDate || null, // Ensure null if undefined
      endDate: finalEndDate || null // Ensure null if undefined
  };

  // Trimitem răspunsul prin callback centralizat
  sendOpenNewReservationOverlay(sendResponse, reservationData);
};

module.exports = {
  handleReservationIntent
}; 