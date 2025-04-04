/**
 * Utilități pentru procesarea textului
 */
const { MAX_MESSAGE_LENGTH } = require('../config/nlpConfig');

/**
 * Normalizează textul pentru procesare
 * @param {string} text - Textul de normalizat
 * @returns {string} Textul normalizat
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Limitează lungimea textului
  if (text.length > MAX_MESSAGE_LENGTH) {
    text = text.substring(0, MAX_MESSAGE_LENGTH);
  }
  
  // Normalizează textul
  return text.toLowerCase().trim();
};

/**
 * Verifică dacă textul conține un pattern
 * @param {string} text - Textul de verificat
 * @param {RegExp|string} pattern - Pattern-ul de căutat
 * @returns {boolean} True dacă textul conține pattern-ul
 */
const containsPattern = (text, pattern) => {
  if (!text || !pattern) {
    return false;
  }
  
  const normalizedText = normalizeText(text);
  
  if (pattern instanceof RegExp) {
    return pattern.test(normalizedText);
  } else {
    return normalizedText.includes(pattern.toLowerCase());
  }
};

/**
 * Extrage toate potrivirile unui pattern din text
 * @param {string} text - Textul din care se extrag potrivirile
 * @param {RegExp} pattern - Pattern-ul de căutat
 * @returns {Array} Array cu potrivirile găsite
 */
const extractMatches = (text, pattern) => {
  if (!text || !pattern || !(pattern instanceof RegExp)) {
    return [];
  }
  
  const matches = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match[0]);
  }
  
  return matches;
};

/**
 * Extrage primul grup de captură dintr-un pattern
 * @param {string} text - Textul din care se extrage grupul
 * @param {RegExp} pattern - Pattern-ul cu grup de captură
 * @returns {string|null} Grupul de captură sau null dacă nu s-a găsit
 */
const extractFirstGroup = (text, pattern) => {
  if (!text || !pattern || !(pattern instanceof RegExp)) {
    return null;
  }
  
  const match = pattern.exec(text);
  return match && match[1] ? match[1] : null;
};

module.exports = {
  normalizeText,
  containsPattern,
  extractMatches,
  extractFirstGroup
}; 