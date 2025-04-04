/**
 * Modul pentru extragerea entităților
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

const { extractDates } = require('./dateExtractor');
const { extractRoomInfo } = require('./roomExtractor');
const { extractProductWithQuantity } = require('./productExtractor');
const { extractIntent } = require('./intentExtractor');

// Cache pentru rezultate
const entityCache = new Map();

// Context pentru extragerea entităților
const context = {
  lastIntent: null,
  lastEntities: null,
  lastMessage: null
};

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
 * Extrage entitățile specifice unei intenții
 * @param {string} message - Mesajul din care se extrag entitățile
 * @param {string} intent - Intenția pentru care se extrag entitățile
 * @returns {Object} Obiect cu entitățile extrase
 */
function extractEntitiesForIntent(message, intent) {
  const entities = {};
  
  switch (intent) {
    case CHAT_INTENTS.RESERVATION:
    case CHAT_INTENTS.MODIFY_RESERVATION:
    case CHAT_INTENTS.CANCEL_RESERVATION:
      // Extragem datele
      const dates = extractDates(message);
      if (dates && dates.length > 0) {
        entities.dates = dates;
      }
      
      // Extragem informațiile despre cameră
      const roomInfo = extractRoomInfo(message);
      if (roomInfo) {
        Object.assign(entities, roomInfo);
      }
      break;
      
    case CHAT_INTENTS.ADD_PHONE:
      // Extragem numărul de telefon
      const phoneMatch = message.match(/\b(?:telefon|phone|numar|număr)\s*:?\s*(\+?[\d\s-]+)\b/i);
      if (phoneMatch) {
        entities.phone = phoneMatch[1].trim();
      }
      break;
      
    case CHAT_INTENTS.CREATE_ROOM:
    case CHAT_INTENTS.MODIFY_ROOM:
      // Extragem informațiile despre cameră
      const createRoomInfo = extractRoomInfo(message);
      if (createRoomInfo) {
        Object.assign(entities, createRoomInfo);
      }
      break;
      
    case CHAT_INTENTS.ROOM_PROBLEM:
      // Extragem informațiile despre cameră și problemă
      const problemRoomInfo = extractRoomInfo(message);
      if (problemRoomInfo) {
        Object.assign(entities, problemRoomInfo);
      }
      break;
      
    case CHAT_INTENTS.SELL_PRODUCT:
      // Extragem informațiile despre produs
      const productInfo = extractProductWithQuantity(message);
      if (productInfo) {
        Object.assign(entities, productInfo);
      }
      break;
  }
  
  return entities;
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
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = entityCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.entities;
    }
    
    // Curăță cache-ul dacă este necesar
    if (entityCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(entityCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const normalizedMessage = normalizeText(message);
    
    // Dacă nu avem intenție, o extragem
    let currentIntent = intent;
    let intentEntities = {};
    
    if (!currentIntent) {
      // Extragem intenția
      const intentResult = extractIntent(normalizedMessage);
      currentIntent = intentResult.intents && intentResult.intents.length > 0 ? intentResult.intents[0] : CHAT_INTENTS.UNKNOWN;
      intentEntities = intentResult.entities || {};
    }
    
    // Dacă avem entități de la intentExtractor, le folosim direct
    if (Object.keys(intentEntities).length > 0) {
      // Actualizăm contextul
      context.lastIntent = currentIntent;
      context.lastEntities = intentEntities;
      context.lastMessage = normalizedMessage;
      
      // Cache rezultatul
      entityCache.set(cacheKey, {
        entities: intentEntities,
        timestamp: Date.now()
      });
      
      return intentEntities;
    }
    
    // Altfel, extragem entitățile specifice intenției
    const specificEntities = extractEntitiesForIntent(normalizedMessage, currentIntent);
    
    // Combinăm entitățile
    const allEntities = {
      ...intentEntities,
      ...specificEntities
    };
    
    // Rezolvăm conflictele cu entitățile anterioare
    const resolvedEntities = resolveEntityConflicts(allEntities, context.lastEntities);
    
    // Actualizăm contextul
    context.lastIntent = currentIntent;
    context.lastEntities = resolvedEntities;
    context.lastMessage = normalizedMessage;
    
    // Cache rezultatul
    entityCache.set(cacheKey, {
      entities: resolvedEntities,
      timestamp: Date.now()
    });
    
    return resolvedEntities;
  } catch (error) {
    console.error('❌ Error in extractEntities:', error);
    return {};
  }
}

module.exports = {
  extractEntities,
  context
}; 