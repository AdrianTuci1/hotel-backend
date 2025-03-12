const extractDates = require("../utils/extractDates");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Regex-uri îmbunătățite
const roomTypeRegex = /\b(single|dubla|twin|apartament|deluxe|superioara|standard)\b/i;
const preferencesRegex = /\b(fumator|nefumator|vedere la mare|etaj superior|parcare inclusa|pat suplimentar|mic dejun inclus)\b/i;

// Lista de cuvinte care nu pot fi nume
const nonNameWords = new Set([
  'rezervare', 'camera', 'pentru', 'vreau', 'doresc', 'hotel',
  'single', 'dubla', 'twin', 'apartament', 'deluxe', 'superioara', 'standard',
  'fumator', 'nefumator', 'vedere', 'mare', 'etaj', 'superior', 'parcare',
  'inclusa', 'inclus', 'pat', 'suplimentar', 'mic', 'dejun',
  'zile', 'nopti', 'pana', 'intre', 'perioada', 'data', 'mar', 'apr', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec',
]);

const normalizeText = (text) => {
  // Convertim la lowercase și eliminăm diacriticele
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const extractName = (message, roomType) => {
  // Normalizăm textul și îl împărțim în tokens
  const normalizedMessage = normalizeText(message);
  const tokens = tokenizer.tokenize(normalizedMessage);
  
  // Găsim poziția tipului de cameră (dacă există)
  const roomTypeIndex = roomType ? tokens.findIndex(token => token.includes(roomType.toLowerCase())) : -1;
  
  // Identificăm potențiale nume (cuvinte care nu sunt în lista de excludere)
  const potentialNames = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => {
      // Excludem cuvinte scurte, numere și cuvinte din lista de excludere
      return token.length > 2 && 
             !nonNameWords.has(token) && 
             !/^\d+$/.test(token) &&
             !/^[0-9./-]+$/.test(token);
    });

  if (potentialNames.length === 0) return null;

  // Dacă avem un tip de cameră, căutăm numele după acesta
  if (roomTypeIndex !== -1) {
    const namesAfterRoomType = potentialNames.filter(({ index }) => index > roomTypeIndex);
    if (namesAfterRoomType.length > 0) {
      // Luăm primele două cuvinte după tipul camerei care ar putea fi nume
      const name = namesAfterRoomType
        .slice(0, 2)
        .map(({ token }) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ');
      return name;
    }
  }

  // Altfel, luăm primele două cuvinte potențiale care ar putea fi nume
  const name = potentialNames
    .slice(0, 2)
    .map(({ token }) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
  return name;
};

const extractEntities = (message) => {
  const normalizedMessage = normalizeText(message);
  let entities = {};

  // Extragem datele
  const extractedDates = extractDates(message);
  if (extractedDates.length > 0) entities.dates = extractedDates;

  // Extragem tipul camerei
  const roomTypeMatch = normalizedMessage.match(roomTypeRegex);
  if (roomTypeMatch) entities.roomType = roomTypeMatch[0].toLowerCase();

  // Extragem numele folosind tipul camerei pentru context
  const name = extractName(message, entities.roomType);
  if (name) entities.name = name;

  // Extragem preferințele
  const preferencesMatch = normalizedMessage.match(preferencesRegex);
  if (preferencesMatch) entities.preferences = preferencesMatch[0].toLowerCase();

  return entities;
};

module.exports = extractEntities;