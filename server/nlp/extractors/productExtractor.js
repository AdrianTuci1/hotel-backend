/**
 * Modul pentru extragerea informațiilor despre produse
 */
const { cleanupCache } = require('../utils/cacheUtils');
const { normalizeText } = require('../utils/textUtils');

// Cache pentru rezultate cu limită de dimensiune
const productCache = new Map();
const quantityCache = new Map();
const MAX_CACHE_SIZE = 500; // Limită maximă pentru cache

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
 * Extrage numele produsului din mesaj
 * @param {string} message - Mesajul din care se extrage numele
 * @returns {string|null} Numele produsului sau null dacă nu s-a găsit
 */
function extractProductName(message) {
  const normalizedMessage = normalizeText(message);
  
  // Verifică cache
  if (productCache.has(normalizedMessage)) {
    return productCache.get(normalizedMessage);
  }
  
  // Curăță cache-ul dacă este necesar
  cleanupCache(productCache, MAX_CACHE_SIZE);
  
  let productName = null;
  
  // Extract product following specific keywords
  const productAfterKeywordPatterns = [
    /\bprodus\s+([a-z\s]+?)(?:\s+\d+|\s*$)/i,  // "produs apa plata"
    /\badauga\s+produs\s+([a-z\s]+?)(?:\s+\d+|\s*$)/i,  // "adauga produs apa plata"
  ];
  
  for (const pattern of productAfterKeywordPatterns) {
    const match = normalizedMessage.match(pattern);
    if (match) {
      productName = match[1].trim();
      break;
    }
  }
  
  // If no product found, try more general patterns
  if (!productName) {
    // Try to find product name by excluding command words and quantities
    // First, remove common command words
    let cleanedMessage = normalizedMessage
      .replace(/\badauga\b/i, '')
      .replace(/\bprodus\b/i, '')
      .trim();
      
    // Then remove quantities
    cleanedMessage = cleanedMessage.replace(/\b\d+\s*(?:buc|bucati|bucăți|bucata|bucată)?\b/i, '').trim();
    
    if (cleanedMessage) {
      // Now the remaining text might be the product name
      productName = cleanedMessage;
    }
  }
  
  // Check if product name is in shortcut list
  if (productName && !productName.includes(' ')) {
    for (const [key, synonyms] of Object.entries(productShortcuts)) {
      if (synonyms.includes(productName)) {
        productName = key;
        break;
      }
    }
  }
  
  // Salvează în cache
  productCache.set(normalizedMessage, productName);
  return productName;
}

/**
 * Extrage cantitatea din mesaj
 * @param {string} message - Mesajul din care se extrage cantitatea
 * @returns {number|null} Cantitatea sau null dacă nu s-a găsit
 */
function extractQuantity(message) {
  const normalizedMessage = normalizeText(message);
  
  // Verifică cache
  if (quantityCache.has(normalizedMessage)) {
    return quantityCache.get(normalizedMessage);
  }
  
  // Curăță cache-ul dacă este necesar
  cleanupCache(quantityCache, MAX_CACHE_SIZE);
  
  let quantity = null;
  
  // Check for "5 buc" pattern
  const bucPattern = /\b(\d+)\s*(?:buc|bucati|bucăți|bucata|bucată)\b/i;
  const bucMatch = normalizedMessage.match(bucPattern);
  if (bucMatch) {
    quantity = parseInt(bucMatch[1], 10);
  } else {
    // Check for standalone number
    const numPattern = /\b(\d+)\b/i;
    const numMatch = normalizedMessage.match(numPattern);
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10);
    }
  }
  
  // Salvează în cache
  quantityCache.set(normalizedMessage, quantity);
  return quantity;
}

/**
 * Extrage toate informațiile despre produs din mesaj
 * @param {string} message - Mesajul din care se extrag informațiile
 * @returns {Object} Obiect cu informațiile extrase
 */
function extractProductInfo(message) {
  const productName = extractProductName(message);
  const quantity = extractQuantity(message);
  
  return {
    productName: productName || null,
    quantity: quantity || null
  };
}

module.exports = {
  extractProductName,
  extractQuantity,
  extractProductInfo,
  productShortcuts,
  units
}; 