/**
 * Modul pentru pattern matching
 */
const { quickRoute } = require('../config/intentPatterns');
const { CHAT_INTENTS } = require('../../socket/utils/messageTypes');
const { extractIntent } = require('../extractors');
const { intentPatterns } = require('../config/intentPatterns');
const { normalizeText } = require('../utils/textUtils');

// Cache pentru rezultate
const intentCache = new Map();
const CACHE_SIZE_LIMIT = 1000;
const CACHE_TTL = 1000 * 60 * 60; // 1 oră

/**
 * Verifică dacă un text conține un pattern
 * @param {string} text - Textul de verificat
 * @param {RegExp} pattern - Pattern-ul de verificat
 * @returns {boolean} - True dacă textul conține pattern-ul
 */
function containsPattern(text, pattern) {
  return pattern.test(text);
}

/**
 * Detectează intenția din mesaj
 * @param {string} message - Mesajul de analizat
 * @returns {string} - Intenția detectată
 */
function detectIntent(message) {
  try {
    // Verifică cache-ul
    const cacheKey = message.toLowerCase().trim();
    const cached = intentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.intent;
    }
    
    // Curăță cache-ul dacă este necesar
    if (intentCache.size >= CACHE_SIZE_LIMIT) {
      intentCache.clear();
    }
    
    // Normalizează textul
    const normalizedMessage = normalizeText(message);
    
    // Verifică rutele rapide
    for (const [keyword, intent] of Object.entries(quickRoute)) {
      if (containsPattern(normalizedMessage, new RegExp(keyword, 'i'))) {
        // Cache rezultatul
        intentCache.set(cacheKey, {
          intent,
          timestamp: Date.now()
        });
        return intent;
      }
    }
    
    // Verifică pattern-urile pentru fiecare intenție
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (containsPattern(normalizedMessage, new RegExp(pattern, 'i'))) {
          // Cache rezultatul
          intentCache.set(cacheKey, {
            intent,
            timestamp: Date.now()
          });
          return intent;
        }
      }
    }
    
    // Verifică pattern-uri specifice pentru comenzi scurte
    if (containsPattern(normalizedMessage, /^calendar$/i) || containsPattern(normalizedMessage, /^rezervari$/i)) {
      const intent = CHAT_INTENTS.SHOW_CALENDAR;
      intentCache.set(cacheKey, {
        intent,
        timestamp: Date.now()
      });
      return intent;
    }
    
    if (containsPattern(normalizedMessage, /^stock$/i) || containsPattern(normalizedMessage, /^stoc$/i) || containsPattern(normalizedMessage, /^inventar$/i)) {
      const intent = CHAT_INTENTS.SHOW_STOCK;
      intentCache.set(cacheKey, {
        intent,
        timestamp: Date.now()
      });
      return intent;
    }
    
    if (containsPattern(normalizedMessage, /^pos$/i) || containsPattern(normalizedMessage, /^vanzare$/i)) {
      const intent = CHAT_INTENTS.SHOW_POS;
      intentCache.set(cacheKey, {
        intent,
        timestamp: Date.now()
      });
      return intent;
    }
    
    if (containsPattern(normalizedMessage, /^facturi$/i) || containsPattern(normalizedMessage, /^factura$/i)) {
      const intent = CHAT_INTENTS.SHOW_INVOICES;
      intentCache.set(cacheKey, {
        intent,
        timestamp: Date.now()
      });
      return intent;
    }
    
    // Cache rezultatul pentru intenție necunoscută
    intentCache.set(cacheKey, {
      intent: CHAT_INTENTS.UNKNOWN,
      timestamp: Date.now()
    });
    
    return CHAT_INTENTS.UNKNOWN;
  } catch (error) {
    console.error('❌ Error in detectIntent:', error);
    return CHAT_INTENTS.UNKNOWN;
  }
}

/**
 * Funcție de rezervă pentru procesarea mesajelor când memoria este critică
 * @param {string} message - Mesajul de procesat
 * @returns {Object} Rezultatul procesării
 */
const fallbackProcessing = (message) => {
  console.log("⚠️ Using fallback processing due to memory constraints");
  
  // Încearcă pattern matching
  const intent = detectIntent(message);
  if (intent && intent !== CHAT_INTENTS.UNKNOWN) {
    return {
      intent,
      message: "✅ Comandă procesată!",
      entities: {},
      confidence: 0.8
    };
  }
  
  // Matching simplu cu cuvinte cheie ca rezervă
  const normalizedMessage = message.toLowerCase().trim();
  
  // Verifică cuvinte cheie pentru rezervări
  if (containsPattern(normalizedMessage, /rezervare/) || containsPattern(normalizedMessage, /rezerva/)) {
    return {
      intent: CHAT_INTENTS.RESERVATION,
      message: "✅ Comandă de rezervare procesată!",
      entities: {},
      confidence: 0.7
    };
  }
  
  // Verifică cuvinte cheie pentru calendar
  if (containsPattern(normalizedMessage, /calendar/) || containsPattern(normalizedMessage, /rezervari/)) {
    return {
      intent: CHAT_INTENTS.SHOW_CALENDAR,
      message: "✅ Calendar afișat!",
      entities: {},
      confidence: 0.9
    };
  }
  
  // Verifică cuvinte cheie pentru stoc
  if (containsPattern(normalizedMessage, /stoc/) || containsPattern(normalizedMessage, /stock/) || containsPattern(normalizedMessage, /inventar/)) {
    return {
      intent: CHAT_INTENTS.SHOW_STOCK,
      message: "✅ Stoc afișat!",
      entities: {},
      confidence: 0.9
    };
  }
  
  // Verifică cuvinte cheie pentru facturi
  if (containsPattern(normalizedMessage, /facturi/) || containsPattern(normalizedMessage, /factura/)) {
    return {
      intent: CHAT_INTENTS.SHOW_INVOICES,
      message: "✅ Facturi afișate!",
      entities: {},
      confidence: 0.9
    };
  }
  
  // Verifică cuvinte cheie pentru POS
  if (containsPattern(normalizedMessage, /pos/) || containsPattern(normalizedMessage, /vanzare/)) {
    return {
      intent: CHAT_INTENTS.SHOW_POS,
      message: "✅ POS afișat!",
      entities: {},
      confidence: 0.9
    };
  }
  
  // Verifică alte intenții comune
  for (const [keyword, intent] of Object.entries(quickRoute)) {
    if (containsPattern(normalizedMessage, keyword)) {
      return {
        intent,
        message: "✅ Comandă procesată!",
        entities: {},
        confidence: 0.8
      };
    }
  }
  
  // Rezervă implicită
  return {
    intent: CHAT_INTENTS.UNKNOWN,
    message: "Nu am înțeles comanda. Vă rog să reformulați.",
    entities: {},
    confidence: 0
  };
};

/**
 * Determină intențiile suplimentare în funcție de intenția principală
 * @param {string} intent - Intenția principală
 * @returns {Array} Array cu intențiile suplimentare
 */
const getExtraIntents = (intent) => {
  const extraIntents = [];
  
  // Dacă intenția este SHOW_CALENDAR, nu adăugăm extra intents
  if (intent === CHAT_INTENTS.SHOW_CALENDAR) {
    return extraIntents;
  }
  
  // Adăugăm intenții suplimentare în funcție de intenția principală
  switch (intent) {
    case CHAT_INTENTS.RESERVATION:
      extraIntents.push(CHAT_INTENTS.SHOW_CALENDAR);
      break;
    case CHAT_INTENTS.MODIFY_RESERVATION:
      extraIntents.push(CHAT_INTENTS.SHOW_CALENDAR);
      break;
    case CHAT_INTENTS.CANCEL_RESERVATION:
      extraIntents.push(CHAT_INTENTS.SHOW_CALENDAR);
      break;
    case CHAT_INTENTS.SELL_PRODUCT:
      extraIntents.push(CHAT_INTENTS.SHOW_POS);
      break;
  }
  
  return extraIntents;
};

module.exports = {
  detectIntent,
  fallbackProcessing,
  getExtraIntents
}; 