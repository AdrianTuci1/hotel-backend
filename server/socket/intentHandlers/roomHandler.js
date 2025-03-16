const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const Room = require("../../models/Room");

/**
 * Handler pentru intenția de creare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const handleCreateRoomIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.CREATE_ROOM,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem toate datele necesare
  if (entities.roomNumber && entities.roomType) {
    // Validăm datele primite
    const roomNumber = parseInt(entities.roomNumber);
    const roomType = entities.roomType;
    const price = entities.price ? parseFloat(entities.price) : 0;
    
    try {
      // Verificăm dacă camera există deja
      const existingRoom = await Room.findOne({
        where: { number: roomNumber }
      });
      
      if (existingRoom) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = `Camera cu numărul ${roomNumber} există deja.`;
      } else {
        // Nu facem crearea propriu-zisă, doar returnăm datele pentru API
        response.type = RESPONSE_TYPES.ROOM;
        response.title = "Creare cameră nouă";
        response.message = `Pregătit pentru a crea camera ${roomNumber} de tip ${roomType}.`;
        response.room = {
          number: roomNumber,
          type: roomType,
          price: price || null,
        };
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea camerei:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la verificarea informațiilor despre cameră.";
    }
  }

  return response;
};

/**
 * Handler pentru intenția de modificare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const handleModifyRoomIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.MODIFY_ROOM,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem numărul camerei
  if (entities.roomNumber) {
    const roomNumber = parseInt(entities.roomNumber);
    
    try {
      // Verificăm dacă camera există
      const room = await Room.findOne({
        where: { number: roomNumber }
      });
      
      if (!room) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = `Camera cu numărul ${roomNumber} nu există.`;
      } else {
        // Returnăm datele pentru API
        response.type = RESPONSE_TYPES.ROOM;
        response.title = "Modificare cameră";
        response.message = `Pregătit pentru a modifica camera ${roomNumber}.`;
        response.room = {
          id: room.id,
          number: room.number,
          type: room.type,
          price: room.price,
        };
      }
    } catch (error) {
      console.error("❌ Eroare la căutarea camerei:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la căutarea camerei.";
    }
  }

  return response;
};

/**
 * Handler pentru intenția de ștergere a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @returns {Promise<Object>} - Răspunsul formatat
 */
const handleDeleteRoomIntent = async (entities, extraIntents = []) => {
  let response = {
    intent: CHAT_INTENTS.DELETE_ROOM,
    entities,
    extraIntents: extraIntents || [],
  };

  // Verificăm dacă avem numărul camerei
  if (entities.roomNumber) {
    const roomNumber = parseInt(entities.roomNumber);
    
    try {
      // Verificăm dacă camera există
      const room = await Room.findOne({
        where: { number: roomNumber }
      });
      
      if (!room) {
        response.type = RESPONSE_TYPES.ERROR;
        response.message = `Camera cu numărul ${roomNumber} nu există.`;
      } else {
        response.type = RESPONSE_TYPES.CONFIRM;
        response.title = "Ștergere cameră";
        response.message = `Sigur doriți să ștergeți camera ${roomNumber}?`;
        response.room = {
          id: room.id,
          number: room.number,
          type: room.type
        };
      }
    } catch (error) {
      console.error("❌ Eroare la căutarea camerei:", error);
      response.type = RESPONSE_TYPES.ERROR;
      response.message = "A apărut o problemă la căutarea camerei.";
    }
  } 

  return response;
};

module.exports = {
  handleCreateRoomIntent,
  handleModifyRoomIntent,
  handleDeleteRoomIntent
}; 