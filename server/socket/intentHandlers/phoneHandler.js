const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");
const {
  sendAddPhoneConfirmation,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Handler pentru intenția de adăugare a unui număr de telefon
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleAddPhoneIntent = async (entities, sendResponse) => {
  console.log('📱 Adăugare număr de telefon cu entități:', entities);

  // Așteptăm rezolvarea promise-ului pentru entități
  const resolvedEntities = await entities;
  console.log('📱 Entități rezolvate:', resolvedEntities);

  // Extragem corect numărul de telefon - poate fi în 'phoneNumber' sau 'phone' și poate fi obiect sau string
  const phoneValueRaw = resolvedEntities.phoneNumber || resolvedEntities.phone;
  if (!phoneValueRaw) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici numărul de telefon care trebuie adăugat.");
    return;
  }
  const phoneNumber = typeof phoneValueRaw === 'object' && phoneValueRaw.value !== undefined
    ? String(phoneValueRaw.value) // Convertim la string
    : String(phoneValueRaw);      // Convertim la string
  console.log(`📱 Număr de telefon identificat: ${phoneNumber}`);

  // Extragem și validăm numărul camerei
  const roomNumberRaw = resolvedEntities.roomNumber;
  if (!roomNumberRaw) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici numărul camerei pentru a găsi rezervarea.");
    return;
  }
  const roomNumber = typeof roomNumberRaw === 'object' && roomNumberRaw.value !== undefined
    ? String(roomNumberRaw.value)
    : String(roomNumberRaw);

  // Extragem și validăm data
  const dateRaw = resolvedEntities.dates?.[0]?.startDate;
  if (!dateRaw) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, "Te rog să specifici data rezervării pentru a asocia numărul de telefon.");
    return;
  }
  const date = typeof dateRaw === 'object' && dateRaw.value !== undefined
    ? String(dateRaw.value) 
    : String(dateRaw);

  try {
    console.log(`🔍 Căutare rezervare pentru camera ${roomNumber} la data ${date} pentru adăugare telefon ${phoneNumber}`);
    
    // Căutăm rezervarea în baza de date
    const reservation = await getReservationByRoomAndDate(roomNumber, date);

    if (reservation) {
      console.log(`✅ Rezervare găsită pentru adăugare telefon: ID ${reservation.id}`);
      
      // Verificăm că avem un ID valid pentru rezervare
      if (!reservation.id) {
        sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`);
        return;
      }
      
      const reservationData = {
        id: reservation.id,
        roomNumber: roomNumber, // Folosim valoarea extrasă și validată
        startDate: reservation.startDate,
        endDate: reservation.endDate
      };

      // Trimitem confirmarea cu ID-ul rezervării folosind funcția centralizată
      sendAddPhoneConfirmation(sendResponse, phoneNumber, reservationData);
    } else {
      // Nu am găsit rezervarea - trimitem un mesaj de eroare folosind funcția centralizată
      sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}. Nu pot asocia numărul de telefon.`);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea rezervării pentru adăugare telefon:", error);
    // Eroare la căutarea în baza de date - trimitem un mesaj de eroare folosind funcția centralizată
    sendErrorResponse(sendResponse, CHAT_INTENTS.ADD_PHONE, `A apărut o eroare la asocierea numărului de telefon cu rezervarea: ${error.message}`);
  }
};

module.exports = {
  handleAddPhoneIntent
}; 