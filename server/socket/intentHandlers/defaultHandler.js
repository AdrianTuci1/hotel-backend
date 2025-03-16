const { RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru cazul în care nu există o intenție specifică sau aceasta nu este clară
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */
const handleDefaultIntent = (entities, extraIntents = []) => {
  return {
    type: RESPONSE_TYPES.OPTIONS,
    entities,
    extraIntents: extraIntents || [],
    title: "Cum vă pot ajuta?",
    options: [
      { id: "reservation", title: "Rezervare nouă", action: "create_reservation" },
      { id: "check_bookings", title: "Verificare rezervări", action: "check_reservations" },
      { id: "room_status", title: "Stare camere", action: "check_rooms" }
    ],
    message: "Nu am înțeles exact ce doriți. Vă pot ajuta cu una din următoarele opțiuni:"
  };
};

module.exports = {
  handleDefaultIntent
}; 