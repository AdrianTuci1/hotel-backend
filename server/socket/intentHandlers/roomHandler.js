const { CHAT_INTENTS, RESPONSE_TYPES } = require("../utils/messageTypes");
const { Room } = require("../../models");

/**
 * Handler pentru intenția de creare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleCreateRoomIntent = async (entities, extraIntents = [], sendResponse) => {
  console.log('🏨 Creare cameră cu entități:', entities);

  // Așteptăm rezolvarea promise-ului pentru entități
  const resolvedEntities = await entities;
  console.log('🏨 Entități rezolvate:', resolvedEntities);

  // Extragem corect numărul camerei - poate fi direct string/number sau obiect cu proprietatea value
  const roomNumber = resolvedEntities.roomNumber 
    ? (typeof resolvedEntities.roomNumber === 'object' && resolvedEntities.roomNumber.value 
      ? resolvedEntities.roomNumber.value 
      : resolvedEntities.roomNumber)
    : null;
    
  // Extragem corect tipul camerei - poate fi direct string sau obiect cu proprietatea value
  const roomType = resolvedEntities.roomType
    ? (typeof resolvedEntities.roomType === 'object' && resolvedEntities.roomType.value
      ? resolvedEntities.roomType.value
      : resolvedEntities.roomType)
    : null;
    
  // Extragem corect prețul - poate fi direct number/string sau obiect cu proprietatea value
  const priceRaw = resolvedEntities.price
    ? (typeof resolvedEntities.price === 'object' && resolvedEntities.price.value
      ? resolvedEntities.price.value
      : resolvedEntities.price)
    : null;
  
  const price = priceRaw ? parseFloat(priceRaw) : 0;
    
  console.log(`🏨 Date extrase: Camera ${roomNumber}, tip ${roomType}, preț ${price}`);

  // Verificăm dacă avem toate datele necesare
  if (!roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.CREATE_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei pentru a o crea.",
      extraIntents: extraIntents || []
    });
    return;
  }
  
  if (!roomType) {
    sendResponse({
      intent: CHAT_INTENTS.CREATE_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici tipul camerei (standard, apartament, etc.).",
      extraIntents: extraIntents || []
    });
    return;
  }
    
  try {
    // Verificăm dacă camera există deja
    const existingRoom = await Room.findOne({
      where: { number: roomNumber }
    });
    
    if (existingRoom) {
      sendResponse({
        intent: CHAT_INTENTS.CREATE_ROOM,
        type: RESPONSE_TYPES.ERROR,
        message: `Camera cu numărul ${roomNumber} există deja.`,
        extraIntents: extraIntents || []
      });
    } else {
      // Nu facem crearea propriu-zisă, doar returnăm datele pentru API
      sendResponse({
        intent: CHAT_INTENTS.CREATE_ROOM,
        type: RESPONSE_TYPES.ROOM,
        title: "Creare cameră nouă",
        message: `Pregătit pentru a crea camera ${roomNumber} de tip ${roomType}.`,
        room: {
          number: roomNumber,
          type: roomType,
          price: price || null,
        },
        extraIntents: extraIntents || []
      });
    }
  } catch (error) {
    console.error("❌ Eroare la verificarea camerei:", error);
    sendResponse({
      intent: CHAT_INTENTS.CREATE_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "A apărut o problemă la verificarea informațiilor despre cameră.",
      extraIntents: extraIntents || []
    });
  }
};

/**
 * Handler pentru intenția de modificare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleModifyRoomIntent = async (entities, extraIntents = [], sendResponse) => {
  console.log('🏨 Modificare cameră cu entități:', entities);

  // Așteptăm rezolvarea promise-ului pentru entități
  const resolvedEntities = await entities;
  console.log('🏨 Entități rezolvate:', resolvedEntities);

  // Extragem corect numărul camerei - poate fi direct string/number sau obiect cu proprietatea value
  const roomNumber = resolvedEntities.roomNumber 
    ? (typeof resolvedEntities.roomNumber === 'object' && resolvedEntities.roomNumber.value 
      ? resolvedEntities.roomNumber.value 
      : resolvedEntities.roomNumber)
    : null;
    
  // Extragem corect tipul camerei - poate fi direct string sau obiect cu proprietatea value
  const roomType = resolvedEntities.roomType
    ? (typeof resolvedEntities.roomType === 'object' && resolvedEntities.roomType.value
      ? resolvedEntities.roomType.value
      : resolvedEntities.roomType)
    : null;
    
  // Extragem corect prețul - poate fi direct number/string sau obiect cu proprietatea value
  const priceRaw = resolvedEntities.price
    ? (typeof resolvedEntities.price === 'object' && resolvedEntities.price.value
      ? resolvedEntities.price.value
      : resolvedEntities.price)
    : null;
  
  const price = priceRaw ? parseFloat(priceRaw) : null;
  
  console.log(`🏨 Camera care urmează să fie modificată: ${roomNumber}, tip: ${roomType}, preț: ${price}`);

  // Verificăm dacă avem numărul camerei
  if (!roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei pentru a o modifica.",
      extraIntents: extraIntents || []
    });
    return;
  }
    
  try {
    // Verificăm dacă camera există
    const room = await Room.findOne({
      where: { number: roomNumber }
    });
    
    if (!room) {
      sendResponse({
        intent: CHAT_INTENTS.MODIFY_ROOM,
        type: RESPONSE_TYPES.ERROR,
        message: `Camera cu numărul ${roomNumber} nu există.`,
        extraIntents: extraIntents || []
      });
    } else {
      console.log(`✅ Cameră găsită pentru modificare: ID=${room.id}`);
      
      // Returnăm datele pentru API
      sendResponse({
        intent: CHAT_INTENTS.MODIFY_ROOM,
        type: RESPONSE_TYPES.ROOM,
        title: "Modificare cameră",
        message: `Pregătit pentru a modifica camera ${roomNumber}.`,
        room: {
          id: room.id,
          number: room.number,
          type: roomType || room.type,
          price: price || room.price,
        },
        extraIntents: extraIntents || []
      });
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea camerei:", error);
    sendResponse({
      intent: CHAT_INTENTS.MODIFY_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "A apărut o problemă la căutarea camerei.",
      extraIntents: extraIntents || []
    });
  }
};

/**
 * Handler pentru intenția de ștergere a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Array} extraIntents - Intențiile adiționale detectate
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleDeleteRoomIntent = async (entities, extraIntents = [], sendResponse) => {
  console.log('🏨 Ștergere cameră cu entități:', entities);

  // Extragem corect numărul camerei - poate fi direct string/number sau obiect cu proprietatea value
  const roomNumber = entities.roomNumber 
    ? (typeof entities.roomNumber === 'object' && entities.roomNumber.value 
      ? entities.roomNumber.value 
      : entities.roomNumber)
    : null;
  
  // Verificăm dacă avem numărul camerei
  if (!roomNumber) {
    sendResponse({
      intent: CHAT_INTENTS.DELETE_ROOM,
      type: RESPONSE_TYPES.ERROR,
      message: "Te rog să specifici numărul camerei pentru a o șterge.",
      extraIntents: extraIntents || []
    });
    return;
  }
    
  try {
    // Verificăm dacă camera există
    const room = await Room.findOne({
      where: { number: roomNumber }
    });
    
    if (!room) {
      sendResponse({
        intent: CHAT_INTENTS.DELETE_ROOM,
        type: RESPONSE_TYPES.ERROR,
        message: `Camera cu numărul ${roomNumber} nu există.`,
        extraIntents: extraIntents || []
      });
    } else {
      sendResponse({
        intent: CHAT_INTENTS.DELETE_ROOM,
        type: RESPONSE_TYPES.CONFIRM,
        title: "Ștergere cameră",
        message: `Sigur doriți să ștergeți camera ${roomNumber}?`,
        room: {
          id: room.id,
          number: room.number,
          type: room.type
        },
        extraIntents: extraIntents || []
      });
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea camerei:", error);
    sendResponse({
      intent: CHAT_INTENTS.DELETE_ROOM,
     type: RESPONSE_TYPES.ERROR,
      message: "A apărut o problemă la căutarea camerei.",
      extraIntents: extraIntents || []
    });
  }
};

module.exports = {
  handleCreateRoomIntent,
  handleModifyRoomIntent,
  handleDeleteRoomIntent
}; 