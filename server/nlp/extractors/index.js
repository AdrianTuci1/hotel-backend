/**
 * Modul pentru extragerea entităților
 */
const { cleanupCache } = require('../utils/cacheUtils');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

const { extractDates } = require('./dateExtractor');
const { extractName, extractPhone } = require('./contactExtractor');
const { extractRoomInfo } = require('./roomExtractor');
const { extractProductInfo } = require('./productExtractor');
const { extractIntent } = require('./intentExtractor');

// Cache pentru rezultate cu limită de dimensiune
const entityCache = new Map();
const MAX_CACHE_SIZE = 1000; // Limită maximă pentru cache

// Context pentru extragerea entităților
let context = {
  lastIntent: null,
  lastEntities: null,
  lastMessage: null
};

/**
 * Resetează contextul
 */
function resetContext() {
  context = {
    lastIntent: null,
    lastEntities: null,
    lastMessage: null
  };
}

/**
 * Normalizează textul pentru procesare
 * @param {string} text - Textul de normalizat
 * @returns {string} Textul normalizat
 */
function normalizeText(text) {
  // Validare input
  if (!text || typeof text !== 'string') return '';
  if (text.length > 1000) {
    console.warn('⚠️ Message too long, truncating to 1000 characters');
    text = text.substring(0, 1000);
  }
  
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Rezolvă conflictele între entități
 * @param {Object} currentEntities - Entitățile curente
 * @param {Object} previousEntities - Entitățile anterioare
 * @returns {Object} Entitățile rezolvate
 */
function resolveEntityConflicts(currentEntities, previousEntities) {
  if (!previousEntities) return currentEntities;
  
  const resolvedEntities = { ...currentEntities };
  
  // Pentru fiecare entitate curentă
  for (const [key, value] of Object.entries(currentEntities)) {
    // Dacă entitatea este null sau undefined, folosim valoarea anterioară
    if (value === null || value === undefined) {
      resolvedEntities[key] = previousEntities[key];
    }
  }
  
  return resolvedEntities;
}

/**
 * Extrage toate entitățile din mesaj
 * @param {string} message - Mesajul din care se extrag entitățile
 * @param {string} intent - Intenția pentru care se extrag entitățile (opțional)
 * @returns {Object} Obiect cu toate entitățile extrase
 */
function extractEntities(message, intent = null) {
  try {
    // Verifică dacă mesajul este valid
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return {};
    }
    
    // Verifică cache
    const cacheKey = `${message}:${intent || 'no_intent'}`;
    if (entityCache.has(cacheKey)) {
      return entityCache.get(cacheKey);
    }

    // Curăță cache-ul dacă este necesar
    cleanupCache(entityCache, MAX_CACHE_SIZE);

    // Extrage intenția dacă nu este furnizată
    if (!intent) {
      const intentResult = extractIntent(message);
      intent = intentResult || CHAT_INTENTS.UNKNOWN;
    }

    let entities = {};

    // Extrage entitățile specifice în funcție de intenție
    switch (intent) {
      case CHAT_INTENTS.RESERVATION:
      case 'reservation':
        const name = extractName(message);
        const dates = extractDates(message);
        const roomInfo = extractRoomInfo(message);
        
        if (name) entities.fullName = name;
        if (roomInfo?.roomType) entities.roomType = roomInfo.roomType;
        if (dates?.startDate) entities.startDate = dates.startDate;
        if (dates?.endDate) entities.endDate = dates.endDate;
        break;

      case CHAT_INTENTS.ADD_ROOM:
      case CHAT_INTENTS.CREATE_ROOM:
      case 'add_room':
      case 'create_room':
        const room = extractRoomInfo(message);
        if (room?.roomNumber) entities.roomNumber = room.roomNumber;
        if (room?.roomType) entities.roomType = room.roomType;
        if (room?.price) entities.price = room.price;
        break;

      case CHAT_INTENTS.ADD_PRODUCT:
      case CHAT_INTENTS.SELL_PRODUCT:
      case 'add_product':
      case 'sell_product':
        const product = extractProductInfo(message);
        if (product?.productName) entities.productName = product.productName;
        if (product?.quantity) entities.quantity = product.quantity;
        break;

      case CHAT_INTENTS.MODIFY_RESERVATION:
      case 'modify_reservation':
        const modifyName = extractName(message);
        const modifyDates = extractDates(message);
        const modifyRoom = extractRoomInfo(message);
        
        if (modifyName || context.lastEntities?.fullName) {
          entities.fullName = modifyName || context.lastEntities.fullName;
        }
        if (modifyRoom?.roomType || context.lastEntities?.roomType) {
          entities.roomType = modifyRoom?.roomType || context.lastEntities.roomType;
        }
        if (modifyDates?.startDate || context.lastEntities?.startDate) {
          entities.startDate = modifyDates?.startDate || context.lastEntities.startDate;
        }
        if (modifyDates?.endDate || context.lastEntities?.endDate) {
          entities.endDate = modifyDates?.endDate || context.lastEntities.endDate;
        }
        break;
        
      case CHAT_INTENTS.ADD_PHONE:
      case 'add_phone':
        const phoneForRoom = extractRoomInfo(message);
        const phone = extractPhone(message);
        
        if (phoneForRoom?.roomNumber) entities.roomNumber = phoneForRoom.roomNumber;
        if (phone) entities.phoneNumber = phone;
        if (phoneForRoom?.roomType) entities.roomType = phoneForRoom.roomType;
        break;
        
      case CHAT_INTENTS.ROOM_PROBLEM:
      case 'room_problem':
        const problemRoom = extractRoomInfo(message);
        
        if (problemRoom?.roomNumber) entities.roomNumber = problemRoom.roomNumber;
        const problemDescription = message.replace(/problema|c\d{3}|\b\d{3}\b/gi, '').trim();
        if (problemDescription) entities.problemDescription = problemDescription;
        break;
    }

    // Actualizează contextul
    context.lastIntent = intent;
    context.lastEntities = entities;
    context.lastMessage = message;

    // Salvează în cache
    entityCache.set(cacheKey, entities);
    
    return entities;
  } catch (error) {
    console.error('Error extracting entities:', error);
    return {};
  }
}

module.exports = {
  extractEntities,
  resetContext,
  normalizeText
}; 