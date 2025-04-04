/**
 * Modul pentru extragerea informațiilor despre produse
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');

// Cache pentru rezultate
const productCache = new Map();

// Cache pentru rezultatele din baza de date
const dbCache = new Map();

// Unități de măsură și sinonimele lor
const units = {
  'bucata': ['bucata', 'buc', 'bucati', 'bucăți', 'piece', 'pieces'],
  'pachet': ['pachet', 'pkg', 'package', 'packages'],
  'cutie': ['cutie', 'cutii', 'box', 'boxes'],
  'sticla': ['sticla', 'sticlă', 'sticle', 'bottle', 'bottles'],
  'kg': ['kg', 'kilograme', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  'g': ['g', 'grame', 'gram', 'grams'],
  'l': ['l', 'litru', 'litri', 'liter', 'liters'],
  'ml': ['ml', 'mililitru', 'mililitri', 'milliliter', 'milliliters']
};

// Shortcut-uri pentru produse
const productShortcuts = {
  'ciocolata': ['ciocolata', 'ciocolată', 'chocolate'],
  'cafea': ['cafea', 'cafe', 'coffee'],
  'apa': ['apa', 'apă', 'water'],
  'bere': ['bere', 'beer'],
  'vin': ['vin', 'wine'],
  'tigari': ['tigari', 'țigări', 'cigarettes'],
  'snack': ['snack', 'snacks', 'gustare', 'gustări'],
  'sandwich': ['sandwich', 'sandvis', 'sandviș'],
  'pizza': ['pizza', 'pizza'],
  'salata': ['salata', 'salată', 'salad'],
  'desert': ['desert', 'dessert'],
  'mic dejun': ['mic dejun', 'breakfast'],
  'pranz': ['pranz', 'prânz', 'lunch'],
  'cina': ['cina', 'cină', 'dinner']
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
 * Extrage cantitatea și unitatea din text
 * @param {string} text - Textul din care se extrage cantitatea
 * @returns {Object} Obiect cu cantitatea și unitatea
 */
function extractQuantity(text) {
  const normalizedText = normalizeText(text);
  
  // Pattern pentru cantități cu unități
  const quantityPattern = /\b(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\b/i;
  const match = normalizedText.match(quantityPattern);
  
  if (match) {
    const quantity = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    // Verificăm dacă unitatea este validă
    for (const [validUnit, synonyms] of Object.entries(units)) {
      if (synonyms.includes(unit)) {
        return { quantity, unit: validUnit };
      }
    }
  }
  
  // Pattern pentru cantități simple
  const simpleQuantityPattern = /\b(\d+(?:\.\d+)?)\b/;
  const simpleMatch = normalizedText.match(simpleQuantityPattern);
  
  if (simpleMatch) {
    return {
      quantity: parseFloat(simpleMatch[1]),
      unit: 'bucata'
    };
  }
  
  return { quantity: 1, unit: 'bucata' };
}

/**
 * Extrage numele produsului din text
 * @param {string} text - Textul din care se extrage numele produsului
 * @returns {string|null} Numele produsului sau null dacă nu este găsit
 */
function extractProductName(text) {
  const normalizedText = normalizeText(text);
  
  // Verificăm mai întâi shortcut-urile
  for (const [product, synonyms] of Object.entries(productShortcuts)) {
    for (const synonym of synonyms) {
      if (normalizedText.includes(synonym)) {
        return product;
      }
    }
  }
  
  // Pattern pentru produse cu nume compuse
  const productPattern = /\b(?:produs|product|item)\s*:?\s*([^.,!?]+)/i;
  const match = normalizedText.match(productPattern);
  
  if (match) {
    return match[1].trim();
  }
  
  return null;
}

/**
 * Extrage produsul și cantitatea din text
 * @param {string} message - Mesajul din care se extrag informațiile
 * @returns {Object} Obiect cu produsul și cantitatea
 */
function extractProductWithQuantity(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.info;
    }
    
    // Curăță cache-ul dacă este necesar
    if (productCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(productCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const { quantity, unit } = extractQuantity(message);
    const product = extractProductName(message);
    
    const info = {
      product,
      quantity,
      unit
    };
    
    // Cache rezultatul
    productCache.set(cacheKey, {
      info,
      timestamp: Date.now()
    });
    
    return info;
  } catch (error) {
    console.error('❌ Error in extractProductWithQuantity:', error);
    return {
      product: null,
      quantity: 1,
      unit: 'bucata'
    };
  }
}

/**
 * Extrage un item din stoc
 * @param {string} message - Mesajul din care se extrage item-ul
 * @returns {Object} Obiect cu item-ul
 */
function extractItem(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = dbCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.item;
    }
    
    // Curăță cache-ul dacă este necesar
    if (dbCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(dbCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const normalizedMessage = normalizeText(message);
    
    // Pattern pentru item-uri din stoc
    const itemPattern = /\b(?:item|produs|product|stoc|stock)\s*:?\s*([^.,!?]+)/i;
    const match = normalizedMessage.match(itemPattern);
    
    if (match) {
      const item = match[1].trim();
      
      // Cache rezultatul
      dbCache.set(cacheKey, {
        item,
        timestamp: Date.now()
      });
      
      return item;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in extractItem:', error);
    return null;
  }
}

module.exports = {
  extractProductWithQuantity,
  extractItem,
  productShortcuts,
  units
}; 