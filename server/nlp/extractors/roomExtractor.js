/**
 * Modul pentru extragerea informațiilor despre camere
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');

// Cache pentru rezultate
const roomCache = new Map();

// Tipuri de camere și sinonimele lor
const roomTypes = {
  'single': ['single', 'simpla', 'simplu', 'o persoana', 'o persoană', '1 persoana', '1 persoană'],
  'double': ['double', 'dubla', 'dublu', 'doua persoane', 'două persoane', '2 persoane'],
  'twin': ['twin', 'twin', 'gemene', '2 paturi', 'doua paturi', 'două paturi'],
  'triple': ['triple', 'tripla', 'triplu', 'trei persoane', '3 persoane'],
  'suite': ['suite', 'suita', 'suită', 'apartament', 'lux', 'luxury'],
  'family': ['family', 'familie', 'familial', 'pentru familie'],
  'business': ['business', 'business', 'pentru business', 'pentru afaceri']
};

// Caracteristici ale camerelor și sinonimele lor
const roomFeatures = {
  'sea_view': ['vedere la mare', 'cu vedere la mare', 'mare view', 'sea view'],
  'mountain_view': ['vedere la munte', 'cu vedere la munte', 'mountain view'],
  'balcony': ['balcon', 'cu balcon', 'terasa', 'terasă', 'cu terasa', 'cu terasă'],
  'smoking': ['fumator', 'fumători', 'cu fumat', 'smoking'],
  'non_smoking': ['nefumator', 'nefumători', 'fara fumat', 'fără fumat', 'non smoking'],
  'breakfast': ['mic dejun', 'cu mic dejun', 'breakfast included'],
  'all_inclusive': ['all inclusive', 'tot inclus', 'tot inclusiv'],
  'air_conditioning': ['aer conditionat', 'cu aer conditionat', 'ac', 'air conditioning'],
  'minibar': ['minibar', 'cu minibar', 'frigider'],
  'tv': ['tv', 'televizor', 'cu tv', 'cu televizor'],
  'wifi': ['wifi', 'internet', 'wireless', 'cu wifi', 'cu internet']
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
 * Extrage numărul camerei din text
 * @param {string} text - Textul din care se extrage numărul camerei
 * @returns {string|null} Numărul camerei sau null dacă nu este găsit
 */
function extractRoomNumber(text) {
  const normalizedText = normalizeText(text);
  
  // Pattern pentru numere de cameră (1-3 cifre)
  const roomNumberPattern = /\b(?:camera|cameră|room|cam)\s*#?\s*(\d{1,3})\b/i;
  const match = normalizedText.match(roomNumberPattern);
  
  if (match) {
    return match[1];
  }
  
  // Pattern pentru coduri de cameră (ex: c301)
  const roomCodePattern = /\b([a-z]\d{3})\b/i;
  const codeMatch = normalizedText.match(roomCodePattern);
  
  if (codeMatch) {
    return codeMatch[1].toUpperCase();
  }
  
  return null;
}

/**
 * Extrage tipul camerei din text
 * @param {string} text - Textul din care se extrage tipul camerei
 * @returns {string|null} Tipul camerei sau null dacă nu este găsit
 */
function extractRoomType(text) {
  const normalizedText = normalizeText(text);
  
  // Căutăm tipul camerei în map
  for (const [type, synonyms] of Object.entries(roomTypes)) {
    for (const synonym of synonyms) {
      if (normalizedText.includes(synonym)) {
        return type;
      }
    }
  }
  
  return null;
}

/**
 * Extrage preferințele pentru cameră din text
 * @param {string} text - Textul din care se extrag preferințele
 * @returns {Array} Array cu preferințele găsite
 */
function extractPreferences(text) {
  const normalizedText = normalizeText(text);
  const preferences = [];
  
  // Căutăm preferințele în map
  for (const [feature, synonyms] of Object.entries(roomFeatures)) {
    for (const synonym of synonyms) {
      if (normalizedText.includes(synonym)) {
        preferences.push(feature);
        break;
      }
    }
  }
  
  return preferences;
}

/**
 * Extrage descrierea problemei din text
 * @param {string} text - Textul din care se extrage descrierea problemei
 * @returns {string|null} Descrierea problemei sau null dacă nu este găsită
 */
function extractProblem(text) {
  const normalizedText = normalizeText(text);
  
  // Pattern pentru probleme
  const problemPattern = /\b(?:problema|probleme|defect|defecte|stricat|stricata|stricată|nu merge|nu funcționează|nu functioneaza)\b\s*:?\s*([^.,!?]+)/i;
  const match = normalizedText.match(problemPattern);
  
  if (match) {
    return match[1].trim();
  }
  
  return null;
}

/**
 * Extrage toate informațiile despre cameră din text
 * @param {string} message - Mesajul din care se extrag informațiile
 * @returns {Object} Obiect cu informațiile extrase
 */
function extractRoomInfo(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = roomCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.info;
    }
    
    // Curăță cache-ul dacă este necesar
    if (roomCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(roomCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const roomNumber = extractRoomNumber(message);
    const roomType = extractRoomType(message);
    const preferences = extractPreferences(message);
    const problem = extractProblem(message);
    
    const info = {
      roomNumber,
      roomType,
      preferences: preferences.length > 0 ? preferences : null,
      problem
    };
    
    // Cache rezultatul
    roomCache.set(cacheKey, {
      info,
      timestamp: Date.now()
    });
    
    return info;
  } catch (error) {
    console.error('❌ Error in extractRoomInfo:', error);
    return {
      roomNumber: null,
      roomType: null,
      preferences: null,
      problem: null
    };
  }
}

module.exports = {
  extractRoomInfo,
  extractRoomNumber,
  extractRoomType,
  extractPreferences,
  extractProblem,
  roomTypes,
  roomFeatures
}; 