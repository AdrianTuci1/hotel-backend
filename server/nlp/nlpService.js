const classifier = require("./classifier");
const extractEntities = require("./extractEntities");
const intentMessages = require("./intentMessages");
const { CHAT_INTENTS } = require("../socket/utils/messageTypes");

// 🔹 Dictionar rapid de rutare
const quickRoute = {
  // Rezervări
  rezervare: CHAT_INTENTS.RESERVATION,
  modifica: CHAT_INTENTS.MODIFY_RESERVATION,
  sterge: CHAT_INTENTS.CANCEL_RESERVATION,
  anuleaza: CHAT_INTENTS.CANCEL_RESERVATION,
  tel: CHAT_INTENTS.ADD_PHONE,
  telefon: CHAT_INTENTS.ADD_PHONE,

  // Camere
  "creeaza cam": CHAT_INTENTS.CREATE_ROOM,
  "adauga camera": CHAT_INTENTS.CREATE_ROOM,
  "modifica cam": CHAT_INTENTS.MODIFY_ROOM,
  "sterge cam": CHAT_INTENTS.DELETE_ROOM,

  // Rapoarte și Facturi
  rapoarte: CHAT_INTENTS.SHOW_REPORTS,
  statistici: CHAT_INTENTS.SHOW_REPORTS,
  facturi: CHAT_INTENTS.SHOW_INVOICES,
  factura: CHAT_INTENTS.SHOW_ROOM_INVOICE,

  // POS și Vânzări
  pos: CHAT_INTENTS.SHOW_POS,
  vinde: CHAT_INTENTS.SELL_PRODUCT,
  adauga: CHAT_INTENTS.SELL_PRODUCT,

  // Altele
  calendar: CHAT_INTENTS.SHOW_CALENDAR,
  stock: CHAT_INTENTS.SHOW_STOCK,
  inventar: CHAT_INTENTS.SHOW_STOCK
};

// 🔥 Funcția de analiză a mesajului
const analyzeMessage = async (message) => {
  const normalizedMessage = message.toLowerCase().trim();
  console.log("🔍 Mesaj normalizat:", normalizedMessage);
  
  // Verificăm mai întâi comenzile compuse (ex: "creeaza cam")
  for (const key of Object.keys(quickRoute)) {
    if (normalizedMessage.startsWith(key)) {
      const intent = quickRoute[key];
      console.log(`🎯 Intenție rapidă detectată: ${intent} pentru comanda: ${key}`);
      return { 
        intent, 
        message: intentMessages[intent], 
        entities: extractEntities(message),
        extraIntents: getExtraIntents(intent)
      };
    }
  }

  // Dacă nu am găsit o comandă compusă, verificăm exact cuvântul
  let intent = quickRoute[normalizedMessage] || null;
  console.log("🔍 Verificare cuvânt exact:", normalizedMessage, "Intent găsit:", intent);

  // 📌 Dacă nu găsim o intenție clară, aplicăm NLP
  if (!intent) {
    const classifications = classifier.getClassifications(normalizedMessage);
    const bestMatch = classifications[0];
    const confidenceThreshold = 0.0009;

    if (!bestMatch || bestMatch.value < confidenceThreshold) {
      console.warn("⚠️ NLP nu este sigur de clasificare:", message);
      return { 
        intent: CHAT_INTENTS.UNKNOWN, 
        message: intentMessages[CHAT_INTENTS.UNKNOWN] 
      };
    }

    intent = bestMatch.label;
  }

  // 🔹 Extragem entitățile relevante
  const entities = extractEntities(message);
  const extraIntents = getExtraIntents(intent);

  console.log("📥 Mesaj primit:", message);
  console.log("🎯 Intenție detectată:", intent);
  console.log("📌 Entități extrase:", entities);
  console.log("➕ Acțiuni suplimentare:", extraIntents);

  return { 
    intent, 
    message: intentMessages[intent] || "✅ Comandă procesată!", 
    entities, 
    extraIntents 
  };
};

// 🎯 Funcție pentru determinarea intențiilor suplimentare
const getExtraIntents = (intent) => {
  const extraIntents = [];
  
  // Dacă intentul este SHOW_CALENDAR, nu adăugăm extra intents
  if (intent === CHAT_INTENTS.SHOW_CALENDAR) {
    return extraIntents;
  }
  
  switch (intent) {
    case CHAT_INTENTS.RESERVATION:
    case CHAT_INTENTS.MODIFY_RESERVATION:
    case CHAT_INTENTS.CANCEL_RESERVATION:
      extraIntents.push("show_calendar");
      break;
    
    case CHAT_INTENTS.SHOW_POS:
      extraIntents.push("open_pos");
      break;
    
    case CHAT_INTENTS.SHOW_STOCK:
      extraIntents.push("open_stock");
      break;
    
    case CHAT_INTENTS.SHOW_REPORTS:
      extraIntents.push("open_reports");
      break;
  }

  return extraIntents;
};

module.exports = { analyzeMessage };