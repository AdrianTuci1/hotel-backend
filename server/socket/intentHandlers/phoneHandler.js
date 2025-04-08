const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");
const {
  sendAddPhoneConfirmation,
  sendErrorResponse
} = require('../utils/uiResponder');
const { Reservation } = require("../../models");

/**
 * Helper function to extract entity values.
 * @param {Object} entities - The extracted entities object.
 * @returns {Object} An object containing extracted values (phoneNumber, roomNumber, date).
 */
const getEntityValues = (entities) => ({
    phoneNumber: entities.phoneNumber?.values[0]?.value,
    roomNumber: entities.roomNumber?.values[0]?.value,
    date: entities.date?.values[0]?.value || entities.startDate?.values[0]?.value // Allow date or startDate
});

/**
 * Handler pentru intenția de adăugare a unui număr de telefon
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleAddPhoneIntent = async (entities, sendResponse) => {
  console.log('📞 Handler adăugare telefon apelat cu entități:', entities);

  const { phoneNumber, roomNumber, date } = getEntityValues(entities);

  if (!phoneNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici numărul de telefon care trebuie adăugat.");
    return;
  }

  // Clean the phone number (remove spaces, dashes, etc.) - adapt regex as needed
  const cleanedPhoneNumber = String(phoneNumber).replace(/\s|-|\(|\)/g, '');
  if (!/^[\+]?[0-9]{10,}$/.test(cleanedPhoneNumber)) { // Basic validation
      sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Numărul de telefon specificat nu pare valid.");
      return;
  }

  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici numărul camerei pentru a găsi rezervarea.");
    return;
  }

  if (!date) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici data rezervării pentru a asocia numărul de telefon.");
    return;
  }

  try {
    // Find the reservation using the service
    const reservation = await getReservationByRoomAndDate(String(roomNumber), date);

    if (!reservation) {
        sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}. Nu pot asocia numărul de telefon.`);
        return;
    }
    
    if (!reservation.id) {
        // This case might indicate an issue with getReservationByRoomAndDate or data integrity
        console.error('Error: Found reservation object missing ID:', reservation);
        sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`);
        return;
    }

    // Update the reservation in the database
    const [updateCount] = await Reservation.update(
      { phone: cleanedPhoneNumber },
      { where: { id: reservation.id } }
    );

    if (updateCount > 0) {
      console.log(`✅ Număr telefon ${cleanedPhoneNumber} adăugat la rezervarea ${reservation.id}`);
      // Send confirmation (uses HISTORY format)
      sendAddPhoneConfirmation(sendResponse, cleanedPhoneNumber, { id: reservation.id });
    } else {
      console.warn(`⚠️ Nu s-a putut actualiza telefonul pentru rezervarea ${reservation.id}. Rezervarea nu a fost găsită în DB (sau telefonul era deja setat)?`);
       sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `Nu s-a putut actualiza numărul de telefon pentru rezervarea #${reservation.id}.`);
    }

  } catch (error) {
    console.error("❌ Eroare la asocierea numărului de telefon cu rezervarea:", error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `A apărut o eroare la asocierea numărului de telefon cu rezervarea: ${error.message}`);
  }
};

module.exports = {
  handleAddPhoneIntent
}; 