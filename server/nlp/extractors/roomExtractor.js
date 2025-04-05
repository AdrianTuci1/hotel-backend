/**
 * Modul pentru extragerea informațiilor despre camere
 */
const { cleanupCache } = require('../utils/cacheUtils');
const { normalizeText } = require('../utils/textUtils');

// Cache pentru rezultate cu limită de dimensiune
const roomCache = new Map();
const roomTypeCache = new Map();
const priceCache = new Map();
const MAX_CACHE_SIZE = 500; // Limită maximă pentru cache

// Lista tipurilor de camere valide
const VALID_ROOM_TYPES = ['single', 'dubla', 'twin', 'tripla', 'apartament', 'suite'];

/**
 * Extrage numărul camerei din mesaj
 * @param {string} message - Mesajul din care se extrage numărul
 * @returns {string|null} Numărul camerei sau null dacă nu s-a găsit
 */
function extractRoomNumber(message) {
  const normalizedMessage = normalizeText(message);
  
  // Verifică cache
  if (roomCache.has(normalizedMessage)) {
    return roomCache.get(normalizedMessage);
  }
  
  // Curăță cache-ul dacă este necesar
  cleanupCache(roomCache, MAX_CACHE_SIZE);
  
  // Caută numărul camerei în format cNNN sau NNN
  let roomNumber = null;
  
  // Look for c + 3 digits pattern
  const cRoomPattern = /\bc(\d{3})\b/i;
  const cRoomMatch = normalizedMessage.match(cRoomPattern);
  if (cRoomMatch) {
    roomNumber = `c${cRoomMatch[1]}`;
  } else {
    // Look for just 3 digits which might be a room number
    const roomPattern = /\b(\d{3})\b/i;
    const roomMatch = normalizedMessage.match(roomPattern);
    if (roomMatch) {
      roomNumber = `c${roomMatch[1]}`;
    }
  }
  
  // Salvează în cache
  roomCache.set(normalizedMessage, roomNumber);
  return roomNumber;
}

/**
 * Extrage tipul camerei din mesaj
 * @param {string} message - Mesajul din care se extrage tipul
 * @returns {string|null} Tipul camerei sau null dacă nu s-a găsit
 */
function extractRoomType(message) {
  const normalizedMessage = normalizeText(message);
  
  // Verifică cache
  if (roomTypeCache.has(normalizedMessage)) {
    return roomTypeCache.get(normalizedMessage);
  }
  
  // Curăță cache-ul dacă este necesar
  cleanupCache(roomTypeCache, MAX_CACHE_SIZE);
  
  let roomType = null;
  
  // Try direct room type match
  for (const type of VALID_ROOM_TYPES) {
    if (normalizedMessage.includes(type)) {
      roomType = type;
      break;
    }
  }
  
  // Additional patterns if direct match failed
  if (!roomType) {
    const patterns = [
      /\bcamera\s+([a-z]+)\b/i,  // "camera dubla"
      /\b([a-z]+)\s+camera\b/i,  // "dubla camera"
    ];
    
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        const potentialType = match[1].toLowerCase();
        if (VALID_ROOM_TYPES.includes(potentialType)) {
          roomType = potentialType;
          break;
        }
      }
    }
  }
  
  // Salvează în cache
  roomTypeCache.set(normalizedMessage, roomType);
  return roomType;
}

/**
 * Extrage prețul din mesaj
 * @param {string} message - Mesajul din care se extrage prețul
 * @returns {number|null} Prețul sau null dacă nu s-a găsit
 */
function extractPrice(message) {
  const normalizedMessage = normalizeText(message);
  
  // Verifică cache
  if (priceCache.has(normalizedMessage)) {
    return priceCache.get(normalizedMessage);
  }
  
  // Curăță cache-ul dacă este necesar
  cleanupCache(priceCache, MAX_CACHE_SIZE);
  
  // Caută prețul în format numeric urmat opțional de "lei" sau "ron"
  let price = null;
  
  // Look for number followed by lei/ron
  const leiPattern = /\b(\d+)\s*(?:lei|ron)\b/i;
  const leiMatch = normalizedMessage.match(leiPattern);
  if (leiMatch) {
    price = parseInt(leiMatch[1], 10);
  } else {
    // If no explicit price with currency, try to find a number
    const numPattern = /\b(\d+)\b/gi; // Make it global for matchAll
    const matches = normalizedMessage.match(numPattern);
    if (matches && matches.length > 0) {
      // Prefer the last number in the message, which is often the price
      price = parseInt(matches[matches.length - 1], 10);
    }
  }
  
  // Salvează în cache
  priceCache.set(normalizedMessage, price);
  return price;
}

/**
 * Extrage toate informațiile despre cameră din mesaj
 * @param {string} message - Mesajul din care se extrag informațiile
 * @returns {Object} Obiect cu informațiile extrase
 */
function extractRoomInfo(message) {
  const roomNumber = extractRoomNumber(message);
  const roomType = extractRoomType(message);
  const price = extractPrice(message);
  
  return {
    roomNumber: roomNumber || null,
    roomType: roomType || null,
    price: price || null
  };
}

module.exports = {
  extractRoomNumber,
  extractRoomType,
  extractPrice,
  extractRoomInfo,
  roomTypes: VALID_ROOM_TYPES
}; 