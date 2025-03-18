const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { getReservationByRoomAndDate } = require("../services/reservationService");

/**
 * Handler pentru intenția de adăugare a unui număr de telefon
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleAddPhoneIntent = async (entities, extraIntents = [], sendResponse) => {
  console.log('📱 Adăugare număr de telefon cu entități:', entities);

  // Verificăm dacă există un număr de telefon în entități (poate fi 'phone' sau 'phoneNumber')
  if (!entities.phoneNumber) {
    // Dacă nu avem număr de telefon, trimitem un mesaj de eroare
    sendResponse({
      intent: CHAT_INTENTS.ADD_PHONE,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul de telefon care trebuie adăugat.",
      extraIntents: extraIntents || [],
      phone: null
    });
    return;
  }

  // Extragem corect numărul de telefon - poate fi în 'phone' sau 'phoneNumber'
  const phoneProperty = entities.phoneNumber ? 'phoneNumber' : 'phone';
  const phoneValue = entities[phoneProperty];
  
  // Verificăm formatul numărului de telefon (poate fi direct string sau obiect cu proprietatea value)
  const phoneNumber = typeof phoneValue === 'object' && phoneValue.value
    ? phoneValue.value
    : phoneValue;
  
  console.log(`📱 Număr de telefon identificat (${phoneProperty}): ${phoneNumber}`);

  // Verificăm dacă avem camera și data pentru a găsi rezervarea
  if (!entities.roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.ADD_PHONE,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei pentru a găsi rezervarea.",
      extraIntents: extraIntents || [],
      phone: phoneNumber
    });
    return;
  }

  // Verificăm dacă avem o dată
  if (!entities.dates || !entities.dates.length || !entities.dates[0].startDate) {
    sendResponse({
      intent: CHAT_INTENTS.ADD_PHONE,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici data rezervării pentru a asocia numărul de telefon.",
      extraIntents: extraIntents || [],
      phone: phoneNumber
    });
    return;
  }

  // Extragem corect numărul camerei - poate fi direct string sau obiect cu proprietatea value
  const roomNumber = typeof entities.roomNumber === 'object' && entities.roomNumber.value 
    ? entities.roomNumber.value 
    : entities.roomNumber;

  // Extragem corect data - poate fi direct string sau obiect cu proprietatea value
  const date = entities.dates[0].startDate.value || entities.dates[0].startDate;

  try {
    console.log(`🔍 Căutare rezervare pentru camera ${roomNumber} la data ${date} pentru adăugare telefon ${phoneNumber}`);
    
    // Căutăm rezervarea în baza de date
    const reservation = await getReservationByRoomAndDate(roomNumber, date);

    if (reservation) {
      console.log(`✅ Rezervare găsită pentru adăugare telefon:`, reservation);
      
      // Verificăm că avem un ID valid pentru rezervare
      if (!reservation.id) {
        sendResponse({
          intent: CHAT_INTENTS.ADD_PHONE,
          type: RESPONSE_TYPES.ERROR,
          message: `Am găsit rezervarea pentru camera ${roomNumber}, dar ID-ul rezervării lipsește.`,
          extraIntents: extraIntents || [],
          phone: phoneNumber
        });
        return;
      }
      
      // Trimitem confirmarea cu ID-ul rezervării
      sendResponse({
        intent: CHAT_INTENTS.ADD_PHONE,
        type: RESPONSE_TYPES.CONFIRM,
        title: "Confirmare număr de telefon",
        message: `Numărul de telefon ${phoneNumber} a fost adăugat cu succes la rezervarea #${reservation.id}.`,
        phone: phoneNumber,
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
        intent: CHAT_INTENTS.ADD_PHONE,
        type: RESPONSE_TYPES.ERROR,
        message: `Nu am găsit nicio rezervare pentru camera ${roomNumber} în data de ${date}. Nu pot asocia numărul de telefon.`,
        extraIntents: extraIntents || [],
        phone: phoneNumber
      });
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea rezervării pentru adăugare telefon:", error);
    // Eroare la căutarea în baza de date - trimitem un mesaj de eroare
    sendResponse({
      intent: CHAT_INTENTS.ADD_PHONE,
      type: RESPONSE_TYPES.ERROR,
      message: `A apărut o eroare la asocierea numărului de telefon cu rezervarea: ${error.message}`,
      extraIntents: extraIntents || [],
      phone: phoneNumber
    });
  }
};

module.exports = {
  handleAddPhoneIntent
}; 