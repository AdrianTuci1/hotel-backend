/**
 * Modul pentru extragerea intențiilor
 */
const { cleanupCache } = require('../utils/memoryUtils');
const { CACHE_SIZE_LIMIT, CACHE_TTL } = require('../config/nlpConfig');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');

// Cache pentru rezultate
const intentCache = new Map();

// Pattern-uri pentru comenzi scurte
const shortCommandPatterns = {
  [CHAT_INTENTS.RESERVATION]: [
    /^([A-Za-z\s]+)\s+(single|double|twin|triple|dubla|twin|tripla)\s+(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)/i,
    /^([A-Za-z\s]+)\s+(single|double|twin|triple|dubla|twin|tripla)\s+(\d{1,2})$/i
  ],
  [CHAT_INTENTS.ADD_PHONE]: [
    /^tel\s+([a-z]\d{3})\s+(\+?[\d\s-]+)$/i,
    /^([a-z]\d{3})\s+(\+?[\d\s-]+)$/i
  ],
  [CHAT_INTENTS.CREATE_ROOM]: [
    /^adauga\s+cam\s+([a-z]\d{3})\s+(single|double|twin|triple|dubla|twin|tripla)\s+(\d+)\s+lei$/i,
    /^([a-z]\d{3})\s+(single|double|twin|triple|dubla|twin|tripla)\s+(\d+)\s+lei$/i
  ],
  [CHAT_INTENTS.MODIFY_RESERVATION]: [
    /^([a-z]\d{3})\s+(\d{1,2})\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|nov|dec)$/i
  ]
};

// Pattern-uri pentru comenzi
const commandPatterns = {
  [CHAT_INTENTS.RESERVATION]: [
    /\b(?:rezervare|rezerva|booking|book)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:fac|facă)\s+(?:o|o)\s+(?:rezervare|rezerva)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:rezerv|rezervez)\s+(?:o|o)\s+(?:camera|cameră)\b/i
  ],
  [CHAT_INTENTS.MODIFY_RESERVATION]: [
    /\b(?:modifica|modifică|change|update)\s+(?:rezervarea|rezervarea|booking)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:modific|modifici)\s+(?:rezervarea|rezervarea)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:schimb|schimbi)\s+(?:rezervarea|rezervarea)\b/i
  ],
  [CHAT_INTENTS.CANCEL_RESERVATION]: [
    /\b(?:anuleaza|anulează|cancel)\s+(?:rezervarea|rezervarea|booking)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:anulez|anulezi)\s+(?:rezervarea|rezervarea)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:sterg|ștergi)\s+(?:rezervarea|rezervarea)\b/i
  ],
  [CHAT_INTENTS.ADD_PHONE]: [
    /\b(?:adauga|adaugă|add)\s+(?:telefon|phone|numar|număr)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:adaug|adaugi)\s+(?:telefon|phone|numar|număr)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:introduc|introduci)\s+(?:telefon|phone|numar|număr)\b/i
  ],
  [CHAT_INTENTS.CREATE_ROOM]: [
    /\b(?:creaza|creează|create|add)\s+(?:camera|cameră|room)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:creez|creezi)\s+(?:o|o)\s+(?:camera|cameră)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:adaug|adaugi)\s+(?:o|o)\s+(?:camera|cameră)\b/i
  ],
  [CHAT_INTENTS.MODIFY_ROOM]: [
    /\b(?:modifica|modifică|change|update)\s+(?:camera|cameră|room)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:modific|modifici)\s+(?:camera|cameră)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:schimb|schimbi)\s+(?:camera|cameră)\b/i
  ],
  [CHAT_INTENTS.ROOM_PROBLEM]: [
    /\b(?:problema|probleme|problem|issue)\s+(?:camera|cameră|room)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:raportez|raportezi)\s+(?:o|o)\s+(?:problema|probleme)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:anunt|anunți)\s+(?:o|o)\s+(?:problema|probleme)\b/i
  ],
  [CHAT_INTENTS.SHOW_REPORTS]: [
    /\b(?:arata|arată|show|display)\s+(?:rapoarte|reports)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:rapoarte|reports)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:generez|generezi)\s+(?:rapoarte|reports)\b/i
  ],
  [CHAT_INTENTS.SHOW_INVOICES]: [
    /\b(?:arata|arată|show|display)\s+(?:facturi|invoices)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:facturi|invoices)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:generez|generezi)\s+(?:facturi|invoices)\b/i
  ],
  [CHAT_INTENTS.SHOW_ROOM_INVOICE]: [
    /\b(?:arata|arată|show|display)\s+(?:factura|invoice)\s+(?:camera|cameră|room)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:factura|invoice)\s+(?:camera|cameră)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:generez|generezi)\s+(?:factura|invoice)\s+(?:camera|cameră)\b/i
  ],
  [CHAT_INTENTS.SHOW_POS]: [
    /\b(?:arata|arată|show|display)\s+(?:pos|terminal)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:pos|terminal)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:deschid|deschizi)\s+(?:pos|terminal)\b/i
  ],
  [CHAT_INTENTS.SELL_PRODUCT]: [
    /\b(?:vinde|vanzare|sale|sell)\s+(?:produs|product)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vand|vinzi)\s+(?:produs|product)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:fac|facă)\s+(?:o|o)\s+(?:vanzare|sale)\b/i
  ],
  [CHAT_INTENTS.SHOW_CALENDAR]: [
    /\b(?:arata|arată|show|display)\s+(?:calendar|schedule)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:calendar|schedule)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:deschid|deschizi)\s+(?:calendar|schedule)\b/i
  ],
  [CHAT_INTENTS.SHOW_STOCK]: [
    /\b(?:arata|arată|show|display)\s+(?:stoc|stock)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:vad|vezi)\s+(?:stoc|stock)\b/i,
    /\b(?:vreau|doresc|dorește|as vrea|aș vrea)\s+(?:sa|să)\s+(?:verific|verifici)\s+(?:stoc|stock)\b/i
  ]
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
 * Extrage intenția din text
 * @param {string} message - Mesajul din care se extrage intenția
 * @returns {Object} Obiect cu intenția și entitățile extrase
 */
function extractIntent(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = intentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }
    
    // Curăță cache-ul dacă este necesar
    if (intentCache.size >= CACHE_SIZE_LIMIT) {
      cleanupCache(intentCache, CACHE_SIZE_LIMIT, CACHE_TTL);
    }
    
    const normalizedMessage = normalizeText(message);
    const intents = [];
    const entities = {};
    
    // Mai întâi verificăm pattern-urile scurte
    for (const [intent, patterns] of Object.entries(shortCommandPatterns)) {
      for (const pattern of patterns) {
        const match = normalizedMessage.match(pattern);
        if (match) {
          intents.push(intent);
          
          // Extragem entitățile specifice intenției
          switch (intent) {
            case CHAT_INTENTS.RESERVATION:
              entities.name = match[1].trim();
              entities.roomType = match[2].toLowerCase();
              if (match[3]) {
                const day = match[3].padStart(2, '0');
                const month = monthMap[match[4].toLowerCase()];
                const year = new Date().getFullYear();
                entities.dates = [{
                  startDate: `${year}-${month}-${day}`,
                  endDate: null
                }];
              }
              break;
              
            case CHAT_INTENTS.ADD_PHONE:
              entities.roomNumber = match[1].toUpperCase();
              entities.phone = match[2].trim();
              break;
              
            case CHAT_INTENTS.CREATE_ROOM:
              entities.roomNumber = match[1].toUpperCase();
              entities.roomType = match[2].toLowerCase();
              entities.price = parseInt(match[3]);
              break;
              
            case CHAT_INTENTS.MODIFY_RESERVATION:
              entities.roomNumber = match[1].toUpperCase();
              const day = match[2].padStart(2, '0');
              const month = monthMap[match[3].toLowerCase()];
              const year = new Date().getFullYear();
              entities.dates = [{
                startDate: `${year}-${month}-${day}`,
                endDate: null
              }];
              break;
          }
          
          // Dacă am găsit o potrivire, returnăm imediat
          const result = {
            intents,
            entities: Object.keys(entities).length > 0 ? entities : null
          };
          
          // Cache rezultatul
          intentCache.set(cacheKey, {
            result,
            timestamp: Date.now()
          });
          
          return result;
        }
      }
    }
    
    // Dacă nu am găsit o potrivire scurtă, verificăm pattern-urile normale
    // Verificăm fiecare intenție
    for (const [intent, patterns] of Object.entries(commandPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedMessage)) {
          intents.push(intent);
          
          // Extragem entitățile specifice intenției
          switch (intent) {
            case CHAT_INTENTS.RESERVATION:
            case CHAT_INTENTS.MODIFY_RESERVATION:
            case CHAT_INTENTS.CANCEL_RESERVATION:
              // Extragem numele clientului
              const nameMatch = normalizedMessage.match(/\b(?:pentru|client|nume)\s*:?\s*([^.,!?]+)/i);
              if (nameMatch) {
                entities.name = nameMatch[1].trim();
              }
              
              // Extragem numărul camerei
              const roomMatch = normalizedMessage.match(/\b(?:camera|cameră|room)\s*#?\s*(\d{1,3})\b/i);
              if (roomMatch) {
                entities.roomNumber = roomMatch[1];
              }
              break;
              
            case CHAT_INTENTS.ADD_PHONE:
              // Extragem numărul de telefon
              const phoneMatch = normalizedMessage.match(/\b(?:telefon|phone|numar|număr)\s*:?\s*(\+?[\d\s-]+)\b/i);
              if (phoneMatch) {
                entities.phone = phoneMatch[1].trim();
              }
              break;
              
            case CHAT_INTENTS.CREATE_ROOM:
            case CHAT_INTENTS.MODIFY_ROOM:
              // Extragem tipul camerei
              const typeMatch = normalizedMessage.match(/\b(?:tip|type)\s*:?\s*([^.,!?]+)\b/i);
              if (typeMatch) {
                entities.roomType = typeMatch[1].trim();
              }
              
              // Extragem preferințele
              const prefMatch = normalizedMessage.match(/\b(?:preferinte|preferințe|preferences)\s*:?\s*([^.,!?]+)\b/i);
              if (prefMatch) {
                entities.preferences = prefMatch[1].trim();
              }
              break;
              
            case CHAT_INTENTS.ROOM_PROBLEM:
              // Extragem numărul camerei
              const problemRoomMatch = normalizedMessage.match(/\b(?:camera|cameră|room)\s*#?\s*(\d{1,3})\b/i);
              if (problemRoomMatch) {
                entities.roomNumber = problemRoomMatch[1];
              }
              
              // Extragem descrierea problemei
              const problemMatch = normalizedMessage.match(/\b(?:problema|probleme|problem)\s*:?\s*([^.,!?]+)\b/i);
              if (problemMatch) {
                entities.problem = problemMatch[1].trim();
              }
              break;
              
            case CHAT_INTENTS.SELL_PRODUCT:
              // Extragem produsul
              const productMatch = normalizedMessage.match(/\b(?:produs|product)\s*:?\s*([^.,!?]+)\b/i);
              if (productMatch) {
                entities.product = productMatch[1].trim();
              }
              
              // Extragem cantitatea
              const quantityMatch = normalizedMessage.match(/\b(?:cantitate|quantity)\s*:?\s*(\d+)\b/i);
              if (quantityMatch) {
                entities.quantity = parseInt(quantityMatch[1]);
              }
              break;
          }
        }
      }
    }
    
    // Dacă nu am găsit nicio intenție, returnăm UNKNOWN
    if (intents.length === 0) {
      intents.push(CHAT_INTENTS.UNKNOWN);
    }
    
    const result = {
      intents,
      entities: Object.keys(entities).length > 0 ? entities : null
    };
    
    // Cache rezultatul
    intentCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error in extractIntent:', error);
    return {
      intents: [CHAT_INTENTS.UNKNOWN],
      entities: null
    };
  }
}

module.exports = {
  extractIntent,
  commandPatterns,
  shortCommandPatterns
}; 