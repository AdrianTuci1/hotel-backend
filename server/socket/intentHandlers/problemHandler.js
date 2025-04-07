const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { RoomStatus } = require("../../models");
const {
  sendProblemReportConfirmation,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Handler pentru intenția de raportare a unei probleme într-o cameră
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleRoomProblemIntent = async (entities, sendResponse) => {
  console.log('🔧 Handler problemă cameră apelat cu entități:', entities);
  
  // Verificăm dacă entities este un obiect valid
  if (!entities || typeof entities !== 'object') {
    console.error('❌ Entități invalide primite:', entities);
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "A apărut o eroare la procesarea mesajului. Vă rugăm să încercați din nou.");
    return;
  }

  // Verificăm dacă avem numărul camerei
  const roomNumberValue = typeof entities.roomNumber === 'object' && entities.roomNumber.value !== undefined 
    ? entities.roomNumber.value 
    : entities.roomNumber;
  if (!roomNumberValue) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Te rog să specifici numărul camerei care are o problemă.");
    return;
  }
  const roomNumber = String(roomNumberValue); // Asigurăm că e string

  // Verificăm dacă avem descrierea problemei
  const problemDescriptionValue = typeof entities.problemDescription === 'object' && entities.problemDescription.value !== undefined
    ? entities.problemDescription.value
    : entities.problemDescription;
  if (!problemDescriptionValue) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Te rog să descrii problema întâmpinată în cameră.");
    return;
  }
  const problemDescription = String(problemDescriptionValue); // Asigurăm că e string
  
  try {
    // Căutăm camera în baza de date
    let roomStatus = await RoomStatus.findOne({
      where: { roomNumber }
    });

    const reportedAt = new Date();

    if (!roomStatus) {
      // Dacă camera nu există, o creăm
      try {
        roomStatus = await RoomStatus.create({
          roomNumber,
          isClean: true,
          hasProblems: true,
          problem: problemDescription,
          reportedAt: reportedAt
        });
      } catch (createError) {
        console.error('❌ Eroare la crearea statusului camerei:', createError);
        sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Nu am putut actualiza statusul camerei. Vă rugăm să încercați din nou.");
        return;
      }
    } else {
      // Dacă camera există, actualizăm statusul
      await roomStatus.update({
        hasProblems: true,
        problem: problemDescription,
        reportedAt: reportedAt
      });
      // Reîncarcăm instanța pentru a avea datele actualizate
      await roomStatus.reload();
    }

    const problemData = {
      roomNumber,
      problemDescription,
      reportedAt: reportedAt.toISOString(),
      status: roomStatus.toJSON()
    };

    // Trimitem răspunsul de succes cu toate informațiile necesare, centralizat
    sendProblemReportConfirmation(sendResponse, problemData);

  } catch (error) {
    console.error('❌ Eroare la actualizarea statusului camerei:', error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Nu am putut actualiza statusul camerei. Vă rugăm să încercați din nou.");
  }
};

module.exports = {
  handleRoomProblemIntent
};
