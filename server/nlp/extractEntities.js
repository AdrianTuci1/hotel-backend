const extractDates = require("../utils/extractDates");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { Stock } = require("../models");

// Regex-uri îmbunătățite
const roomTypeRegex = /\b(single|dubla|twin|apartament|deluxe|superioara|standard)\b/i;
const preferencesRegex = /\b(fumator|nefumator|vedere la mare|etaj superior|parcare inclusa|pat suplimentar|mic dejun inclus)\b/i;
// Îmbunătățim regex-ul pentru numere de cameră pentru a captura mai bine formatul "cam 301"
const roomNumberRegex = /\b(?:camera|cam\.?|c\.?|nr\.?)\s*(?:de|cu|numar|număr)?\s*(\d{1,4})\b|\b(\d{1,4})\s*(?:camera|cam\.?)\b|\bc(\d{1,4})\b|\b(\d{3})\b|\b(?:camera|cam\.?)\s*(\d{1,4})\b/i;
const phoneNumberRegex = /\b(?:telefon|tel\.?|numar|număr|nr\.?)?:?\s*((?:\+?4?0|0)?[ \-\.]?(?:7[0-9]{2}|7[0-9]{8}|[0-9]{2}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}|[0-9]{3}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}))\b/i;
const problemKeywords = /\b(problema|probl|issue|defect)\b/i;
// Adăugăm regex pentru preț
const priceRegex = /\b(\d+)\s*(?:lei|ron|€|euro)?\b/i;

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
    // Verificăm toate grupele de captură și returnăm prima valoare găsită non-null
    for (let i = 1; i < match.length; i++) {
      if (match[i]) return match[i];
    }
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
  const problemKeywordIndex = message.toLowerCase().indexOf(problemMatch[0].toLowerCase());
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

const extractPrice = (message) => {
  const match = message.match(priceRegex);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return null;
};

const extractItem = async (message) => {
  const normalizedMessage = normalizeText(message);
  
  // Obținem toate elementele din stoc
  const items = await Stock.findAll({
    attributes: ['name']
  });

  // Creăm un regex din numele elementelor
  const itemNames = items.map(item => item.name.toLowerCase());
  const itemRegex = new RegExp(`\\b(${itemNames.join('|')})\\b`, 'i');
  
  const match = normalizedMessage.match(itemRegex);
  if (match) {
    return match[0].toLowerCase();
  }
  return null;
};

const extractEntities = async (message) => {
  const normalizedMessage = normalizeText(message);
  let entities = {};

  // Verificăm dacă mesajul conține un cuvânt cheie pentru probleme
  const hasProblemKeyword = normalizedMessage.match(problemKeywords);
  
  // Dacă avem un cuvânt cheie pentru probleme, procesăm mai întâi acest caz
  if (hasProblemKeyword) {
    const roomNumber = extractRoomNumber(message);
    const problemDescription = extractProblemDescription(message);
    
    if (roomNumber && problemDescription) {
      entities.roomNumber = roomNumber;
      entities.problemDescription = problemDescription;
      return entities;
    }
  }

  // Pentru alte cazuri, continuăm cu extragerea normală a entităților
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

  // Extragem prețul
  const price = extractPrice(message);
  if (price) entities.price = price;

  // Extragem elementul din stoc
  const item = await extractItem(message);
  if (item) entities.item = item;

  return entities;
};

module.exports = extractEntities;