const normalizeText = (text) => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Lista de cuvinte care nu pot fi nume
const nonNameWords = new Set([
  'rezervare', 'camera', 'pentru', 'vreau', 'doresc', 'hotel',
  'single', 'dubla', 'twin', 'apartament', 'deluxe', 'superioara', 'standard',
  'fumator', 'nefumator', 'vedere', 'mare', 'etaj', 'superior', 'parcare',
  'inclusa', 'inclus', 'pat', 'suplimentar', 'mic', 'dejun',
  'zile', 'nopti', 'pana', 'intre', 'perioada', 'data', 'mar', 'apr', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec', 
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie',
  'problema', 'probl', 'issue', 'defect'
]);

const phoneNumberRegex = /\b(?:telefon|tel\.?|numar|număr|nr\.?)?:?\s*((?:\+?4?0|0)?[ \-\.]?(?:7[0-9]{2}|7[0-9]{8}|[0-9]{2}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}|[0-9]{3}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{3}))\b/i;

const extractName = (message, roomType) => {
  const normalizedMessage = normalizeText(message);
  const tokens = tokenizer.tokenize(normalizedMessage);
  
  const roomTypeIndex = roomType ? tokens.findIndex(token => token.includes(roomType.toLowerCase())) : -1;
  
  const potentialNames = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => {
      return token.length > 2 && 
             !nonNameWords.has(token) && 
             !/^\d+$/.test(token) &&
             !/^[0-9./-]+$/.test(token);
    });

  if (potentialNames.length === 0) return null;

  if (roomTypeIndex !== -1) {
    const namesAfterRoomType = potentialNames.filter(({ index }) => index > roomTypeIndex);
    if (namesAfterRoomType.length > 0) {
      const name = namesAfterRoomType
        .slice(0, 2)
        .map(({ token }) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ');
      return name;
    }
  }

  const name = potentialNames
    .slice(0, 2)
    .map(({ token }) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
  return name;
};

const extractPhoneNumber = (message) => {
  const match = message.match(phoneNumberRegex);
  if (match && match[1]) {
    return match[1].replace(/[\s\-\.]/g, '');
  }
  return null;
};

module.exports = {
  extractName,
  extractPhoneNumber,
  nonNameWords,
  phoneNumberRegex
}; 