const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const { RoomStatus, ProblemReport } = require("../../models");
const {
  sendProblemReportConfirmation,
  sendErrorResponse
} = require('../utils/uiResponder');

/**
 * Helper function to extract entity values.
 * @param {Object} entities - The extracted entities object.
 * @returns {Object} An object containing extracted values (roomNumber, problemDescription).
 */
const getEntityValues = (entities) => ({
  roomNumber: entities.roomNumber?.values[0]?.value,
  problemDescription: entities.problemDescription?.values[0]?.value
});

/**
 * Handler for reporting a room problem.
 * Validates entities, saves the report, and sends confirmation.
 * @param {Object} entities - Extracted entities.
 * @param {Function} sendResponse - Callback function to send the response.
 */
const handleRoomProblemIntent = async (entities, sendResponse) => {
  console.log('🔧 Handler raportare problemă cameră apelat cu entități:', entities);

  if (!entities) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "A apărut o eroare la procesarea mesajului. Vă rugăm să încercați din nou.");
    return;
  }

  const { roomNumber, problemDescription } = getEntityValues(entities);

  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Te rog să specifici numărul camerei care are o problemă.");
    return;
  }

  if (!problemDescription) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Te rog să descrii problema întâmpinată în cameră.");
    return;
  }

  try {
    // Save the problem report to the database
    const reportData = {
      roomNumber: String(roomNumber),
      description: String(problemDescription),
      reportedAt: new Date(),
      status: 'reported' // Initial status
    };
    
    const newReport = await ProblemReport.create(reportData);
    console.log('💾 Problemă cameră salvată în DB:', newReport.id);

    // Send confirmation (which uses HISTORY format now)
    sendProblemReportConfirmation(sendResponse, reportData);

    // TODO: Optionally update room status in the Room model
    // try {
    //   await Room.update({ status: 'needs_maintenance' }, { where: { number: reportData.roomNumber } });
    //   console.log(`🚪 Status cameră ${reportData.roomNumber} actualizat la 'needs_maintenance'.`);
    // } catch (roomUpdateError) {
    //   console.error('❌ Eroare la actualizarea statusului camerei:', roomUpdateError);
    //   // Decide if we should notify the user about this secondary failure
    //   // sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "Nu am putut actualiza statusul camerei. Vă rugăm să încercați din nou.");
    // }

  } catch (error) {
    console.error('❌ Eroare la salvarea raportului de problemă:', error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.ROOM_PROBLEM, "A apărut o eroare la salvarea raportului. Vă rugăm să încercați din nou.");
  }
};

module.exports = {
  handleRoomProblemIntent
};
