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
    message: "Nu am înțeles exact ce doriți. Vă pot ajuta cu una din următoarele opțiuni:"
  };
};

module.exports = {
  handleDefaultIntent
}; 