const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const RoomStatus = require("../../models/RoomStatus");

/**
 * Handler pentru intenția de raportare a unei probleme într-o cameră
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleRoomProblemIntent = async (entities, extraIntents = [], sendResponse) => {
  console.log('🔧 Handler problemă cameră apelat cu entități:', entities);
  
  if (!entities.roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.ROOM_PROBLEM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei care are o problemă.",
      extraIntents: extraIntents || [],
      reservation: null
    });
    return;
  }

  if (!entities.problemDescription) {
    sendResponse({
      intent: CHAT_INTENTS.ROOM_PROBLEM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să descrii problema întâmpinată în cameră.",
      extraIntents: extraIntents || [],
      reservation: null
    });
    return;
  }

  const roomNumber = entities.roomNumber;
  const problemDescription = entities.problemDescription;
  
  try {
    // Căutăm camera în baza de date
    let roomStatus = await RoomStatus.findOne({
      where: { roomNumber }
    });

    if (!roomStatus) {
      // Dacă camera nu există, o creăm
      try {
        roomStatus = await RoomStatus.create({
          roomNumber,
          isClean: true,
          hasProblems: true,
          problem: problemDescription
        });
      } catch (createError) {
        console.error('❌ Eroare la crearea statusului camerei:', createError);
        sendResponse({
          intent: CHAT_INTENTS.ROOM_PROBLEM,
          type: RESPONSE_TYPES.ERROR,
          message: "Nu am putut actualiza statusul.",
          extraIntents: extraIntents || [],
          reservation: null
        });
        return;
      }
    } else {
      // Dacă camera există, actualizăm statusul
      await roomStatus.update({
        hasProblems: true,
        problem: problemDescription
      });
    }

    // Trimitem răspunsul de succes
    sendResponse({
      intent: CHAT_INTENTS.ROOM_PROBLEM,
      type: RESPONSE_TYPES.CONFIRM,
      message: `Problema adaugată cu succes pentru camera ${roomNumber}`,
      extraIntents: extraIntents || [],
      reservation: null,
      // Adăugăm informații despre problema adăugată (opțional)
      problem: {
        roomNumber,
        problemDescription,
        reportedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Eroare la actualizarea statusului camerei:', error);
    sendResponse({
      intent: CHAT_INTENTS.ROOM_PROBLEM,
      type: RESPONSE_TYPES.ERROR,
      message: "Nu am putut actualiza statusul.",
      extraIntents: extraIntents || [],
      reservation: null
    });
  }
};

module.exports = {
  handleRoomProblemIntent
};
