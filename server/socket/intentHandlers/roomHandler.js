const { CHAT_INTENTS /*, RESPONSE_TYPES */ } = require("../utils/messageTypes");
const { Room } = require("../../models");
const {
  sendCreateRoomResponse,
  sendModifyRoomResponse,
  sendDeleteRoomConfirmation,
  sendErrorResponse
} = require('../utils/uiResponder');

// Helper function to extract entity value (string or object.value)
const extractEntityValue = (entity) => {
  if (entity === null || entity === undefined) return null;
  return typeof entity === 'object' && entity.value !== undefined ? entity.value : entity;
};

/**
 * Check if a value is a valid number.
 * @param {*} value - The value to check.
 * @returns {boolean} True if it's a valid number, false otherwise.
 */
const isValidNumber = (value) => {
    return value !== null && value !== '' && !isNaN(Number(value));
};

/**
 * Handler pentru intenția de creare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleCreateRoomIntent = async (entities, sendResponse) => {
  console.log('🏨 Creare cameră cu entități:', entities);

  // Așteptăm rezolvarea promise-ului pentru entități
  const resolvedEntities = await entities;
  console.log('🏨 Entități rezolvate pentru creare:', resolvedEntities);

  const roomNumber = extractEntityValue(resolvedEntities.roomNumber);
  const roomType = extractEntityValue(resolvedEntities.roomType);
  const priceRaw = extractEntityValue(resolvedEntities.price);
  const price = priceRaw ? parseFloat(priceRaw) : 0;
    
  console.log(`🏨 Date extrase pentru creare: Camera ${roomNumber}, tip ${roomType}, preț ${price}`);

  // Verificăm dacă avem toate datele necesare
  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.CREATE_ROOM, "Te rog să specifici numărul camerei pentru a o crea.");
    return;
  }
  
  if (!roomType) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.CREATE_ROOM, "Te rog să specifici tipul camerei (standard, apartament, etc.).");
    return;
  }
    
  try {
    // Verificăm dacă camera există deja
    const existingRoom = await Room.findOne({
      where: { number: String(roomNumber) } // Asigurăm string
    });
    
    if (existingRoom) {
      sendErrorResponse(sendResponse, CHAT_INTENTS.CREATE_ROOM, `Camera cu numărul ${roomNumber} există deja.`);
    } else {
      const roomData = {
          number: String(roomNumber), // Asigurăm string
          type: String(roomType),     // Asigurăm string
          price: isValidNumber(price) ? Number(price) : null,
      };
      // Nu facem crearea propriu-zisă, doar returnăm datele pentru API
      sendCreateRoomResponse(sendResponse, roomData);
    }
  } catch (error) {
    console.error("❌ Eroare la verificarea camerei pentru creare:", error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.CREATE_ROOM, "A apărut o problemă la verificarea informațiilor despre cameră.");
  }
};

/**
 * Handler pentru intenția de modificare a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleModifyRoomIntent = async (entities, sendResponse) => {
  console.log('🏨 Modificare cameră cu entități:', entities);

  // Așteptăm rezolvarea promise-ului pentru entități
  const resolvedEntities = await entities;
  console.log('🏨 Entități rezolvate pentru modificare:', resolvedEntities);

  const roomNumber = extractEntityValue(resolvedEntities.roomNumber);
  const roomType = extractEntityValue(resolvedEntities.roomType); // Poate fi null dacă nu se modifică
  const priceRaw = extractEntityValue(resolvedEntities.price);     // Poate fi null dacă nu se modifică
  const price = priceRaw ? parseFloat(priceRaw) : null;
  
  console.log(`🏨 Camera care urmează să fie modificată: ${roomNumber}, tip: ${roomType}, preț: ${price}`);

  // Verificăm dacă avem numărul camerei
  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_ROOM, "Te rog să specifici numărul camerei pentru a o modifica.");
    return;
  }
    
  try {
    // Verificăm dacă camera există
    const room = await Room.findOne({
      where: { number: String(roomNumber) } // Asigurăm string
    });
    
    if (!room) {
      sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_ROOM, `Camera cu numărul ${roomNumber} nu există.`);
    } else {
      console.log(`✅ Cameră găsită pentru modificare: ID=${room.id}`);
      
      const roomData = {
          id: room.id,
          number: room.number, // Folosim numărul existent
          // Folosim valorile noi dacă sunt specificate, altfel păstrăm cele existente
          type: roomType ? String(roomType) : room.type, 
          price: isValidNumber(price) ? Number(price) : (isValidNumber(room.price) ? room.price : null), // Păstrăm prețul existent dacă cel nou e null
      };
      // Returnăm datele pentru API
      sendModifyRoomResponse(sendResponse, roomData);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea camerei pentru modificare:", error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.MODIFY_ROOM, "A apărut o problemă la căutarea camerei.");
  }
};

/**
 * Handler pentru intenția de ștergere a camerelor
 * @param {Object} entities - Entitățile extrase din mesaj
 * @param {Function} sendResponse - Funcția de callback pentru trimiterea răspunsului
 */
const handleDeleteRoomIntent = async (entities, sendResponse) => {
  console.log('🏨 Ștergere cameră cu entități:', entities);
  
  const resolvedEntities = await entities;
  console.log('🏨 Entități rezolvate pentru ștergere:', resolvedEntities);

  const roomNumber = extractEntityValue(resolvedEntities.roomNumber);
  
  // Verificăm dacă avem numărul camerei
  if (!roomNumber) {
    sendErrorResponse(sendResponse, CHAT_INTENTS.DELETE_ROOM, "Te rog să specifici numărul camerei pentru a o șterge.");
    return;
  }
    
  try {
    // Verificăm dacă camera există
    const room = await Room.findOne({
      where: { number: String(roomNumber) } // Asigurăm string
    });
    
    if (!room) {
      sendErrorResponse(sendResponse, CHAT_INTENTS.DELETE_ROOM, `Camera cu numărul ${roomNumber} nu există.`);
    } else {
      const roomData = {
          id: room.id,
          number: room.number,
          type: room.type
      };
      sendDeleteRoomConfirmation(sendResponse, roomData);
    }
  } catch (error) {
    console.error("❌ Eroare la căutarea camerei pentru ștergere:", error);
    sendErrorResponse(sendResponse, CHAT_INTENTS.DELETE_ROOM, "A apărut o problemă la căutarea camerei pentru ștergere.");
  }
};

module.exports = {
  handleCreateRoomIntent,
  handleModifyRoomIntent,
  handleDeleteRoomIntent
}; 