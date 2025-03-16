const { getAvailableRooms } = require("../../utils/roomUtils");
const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de rezervare
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleReservationIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.RESERVATION,
    entities,
    extraIntents: ["show_calendar"],
  };

  // Verificăm disponibilitatea pentru rezervare
  if (entities.startDate && entities.endDate) {
    const startDate = entities.startDate;
    const endDate = entities.endDate;
    
    try {
      const availableRooms = await getAvailableRooms(startDate, endDate);
      
      if (availableRooms.length === 0) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = "Ne pare rău, nu sunt camere disponibile pentru perioada selectată.";
      } else {
        response = {
          intent: CHAT_INTENTS.RESERVATION,
          message: `📅 Rezervare pentru ${entities.name || "N/A"} într-o cameră ${entities.roomType || "necunoscută"} de la ${startDate} până la ${endDate} (${entities.preferences || "fără preferințe"})`,
          type: RESPONSE_TYPES.FORM,
          reservation: {
            guestName: entities.name || "N/A",
            roomType: entities.roomType || "necunoscută",
            startDate,
            endDate,
            preferences: entities.preferences || "fără preferințe",
            availableRooms
          },
          extraIntents: extraIntents || ["show_calendar"]
        };
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea disponibilității:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la verificarea disponibilității camerelor.";
    }
  }
  
  return response;
};

module.exports = {
  handleReservationIntent
}; 