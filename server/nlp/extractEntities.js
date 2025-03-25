const extractDates = require("../utils/extractDates");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Regex-uri îmbunătățite
const roomTypeRegex = /\b(single|dubla|twin|apartament|deluxe|superioara|standard)\b/i;
const preferencesRegex = /\b(fumator|nefumator|vedere la mare|etaj superior|parcare inclusa|pat suplimentar|mic dejun inclus)\b/i;
// Adăugăm regex pentru numere de cameră și telefon
const roomNumberRegex = /\b(?:camera|cam\.?|c\.?|nr\.?)\s*(?:de|cu|numar|număr)?\s*(\d{1,4})\b|\b(\d{1,4})\s*(?:camera|cam\.?)\b|\bc(\d{1,4})\b|\b(\d{3})\b/i;
const phoneNumberRegex = /\b(?:telefon|tel\.?|numar|număr|nr\.?)?:?\s*((?:\+?4?0|0)?[ \-\.]?(?:7[0-9]{2}|7[0-9]{8}|[0-9]{2}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}|[0-9]{3}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}))\b/i;
const problemKeywords = /\b(problema|probl|issue|defect)\b/i;

// Lista de cuvinte care nu pot fi nume
const nonNameWords = new Set([
  'rezervare', 'camera', 'pentru', 'vreau', 'doresc', 'hotel',
  'single', 'dubla', 'twin', 'apartament', 'deluxe', 'superioara', 'standard',
  'fumator', 'nefumator', 'vedere', 'mare', 'etaj', 'superior', 'parcare',
  'inclusa', 'inclus', 'pat', 'suplimentar', 'mic', 'dejun',
  'zile', 'nopti', 'pana', 'intre', 'perioada', 'data', 'mar', 'apr', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec', 
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie',
  'problema', 'probl', 'issue', 'defect']);

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

const extractRoomNumber = (message) => {
  const match = message.match(roomNumberRegex);
  if (match) {
    // Verificăm grupele de captură în ordinea priorității și returnăm prima valoare găsită non-null
    return match[1] || match[2] || match[3] || match[4];
  }
  return null;
};

const extractPhoneNumber = (message) => {
  const match = message.match(phoneNumberRegex);
  if (match && match[1]) {
    // Formatăm numărul de telefon pentru a elimina spațiile și alte caractere
    return match[1].replace(/[\s\-\.]/g, '');
  }
  return null;
};

const extractProblemDescription = (message) => {
  // Verificăm dacă mesajul conține un cuvânt cheie pentru probleme
  const problemMatch = message.match(problemKeywords);
  if (!problemMatch) return null;

  // Identificăm numărul camerei
  const roomNumber = extractRoomNumber(message);
  if (!roomNumber) return null;

  // Găsim poziția cuvântului cheie și a numărului camerei în mesaj
  const problemKeywordIndex = message.indexOf(problemMatch[0]);
  const roomNumberIndex = message.indexOf(roomNumber, problemKeywordIndex);
  
  // Dacă am găsit ambele elemente, extragem textul după numărul camerei
  if (roomNumberIndex > problemKeywordIndex) {
    // Calculăm indexul de început după numărul camerei
    const startIndex = roomNumberIndex + roomNumber.length;
    
    // Verificăm dacă mai există text după numărul camerei
    if (startIndex < message.length) {
      // Extragem și normalizăm descrierea problemei
      const problemDescription = message.substring(startIndex).trim();
      return problemDescription || null;
    }
  }
  
  return null;
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

  // Extragem numărul camerei
  const roomNumber = extractRoomNumber(message);
  if (roomNumber) entities.roomNumber = roomNumber;

  // Extragem numărul de telefon
  const phoneNumber = extractPhoneNumber(message);
  if (phoneNumber) entities.phoneNumber = phoneNumber;
  
  // Extragem descrierea problemei
  const problemDescription = extractProblemDescription(message);
  if (problemDescription) entities.problemDescription = problemDescription;

  return entities;
};

module.exports = extractEntities;