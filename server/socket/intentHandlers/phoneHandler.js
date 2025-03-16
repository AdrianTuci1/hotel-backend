const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");

/**
 * Handler pentru intenția de adăugare a unui număr de telefon
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Object} - Răspunsul formatat
 */


const handleAddPhoneIntent = (entities, extraIntents = []) => {
  // Verificăm dacă există deja un număr de telefon în entități
  if (entities.phone) {
    // Dacă avem deja numărul de telefon, returnăm confirmarea
    return {
      intent: CHAT_INTENTS.ADD_PHONE,
      type: RESPONSE_TYPES.CONFIRM,
      title: "Confirmare număr de telefon",
      message: `Numărul de telefon ${entities.phone} a fost adăugat cu succes.`,
      entities,
      extraIntents: extraIntents || [],
    };
  }

};

module.exports = {
  handleAddPhoneIntent
}; 