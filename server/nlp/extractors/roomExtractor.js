const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Regex-uri îmbunătățite
const roomTypeRegex = /\b(single|dubla|twin|apartament|deluxe|superioara|standard)\b/i;
const preferencesRegex = /\b(fumator|nefumator|vedere la mare|etaj superior|parcare inclusa|pat suplimentar|mic dejun inclus)\b/i;
const roomNumberRegex = /\b(?:camera|cam\.?|c\.?|nr\.?)\s*(?:de|cu|numar|număr)?\s*(\d{1,4})\b|\b(\d{1,4})\s*(?:camera|cam\.?)\b|\bc(\d{1,4})\b|\b(\d{3})\b|\b(?:camera|cam\.?)\s*(\d{1,4})\b/i;
const problemKeywords = /\b(problema|probl|issue|defect)\b/i;

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

const extractRoomType = (message) => {
  const normalizedMessage = normalizeText(message);
  const roomTypeMatch = normalizedMessage.match(roomTypeRegex);
  return roomTypeMatch ? roomTypeMatch[0].toLowerCase() : null;
};

const extractRoomPreferences = (message) => {
  const normalizedMessage = normalizeText(message);
  const preferencesMatch = normalizedMessage.match(preferencesRegex);
  return preferencesMatch ? preferencesMatch[0].toLowerCase() : null;
};

const extractRoomProblem = (message) => {
  const normalizedMessage = normalizeText(message);
  const problemMatch = normalizedMessage.match(problemKeywords);
  if (!problemMatch) return null;

  const roomNumber = extractRoomNumber(message);
  if (!roomNumber) return null;

  const problemKeywordIndex = normalizedMessage.indexOf(problemMatch[0]);
  const roomNumberIndex = message.indexOf(roomNumber, problemKeywordIndex);
  
  if (roomNumberIndex > problemKeywordIndex) {
    const startIndex = roomNumberIndex + roomNumber.length;
    
    if (startIndex < message.length) {
      const problemDescription = message.substring(startIndex).trim();
      return problemDescription || null;
    }
  }
  
  return null;
};

module.exports = {
  extractRoomNumber,
  extractRoomType,
  extractRoomPreferences,
  extractRoomProblem,
  roomTypeRegex,
  preferencesRegex,
  roomNumberRegex,
  problemKeywords
}; 