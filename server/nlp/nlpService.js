const classifier = require("./classifier");
const extractEntities = require("./extractEntities");
const intentMessages = require("./intentMessages");

// 🔹 Dictionar rapid de rutare
const quickRoute = {
  rezervare: "reservation",
  modifica: "modify_reservation",
  sterge: "cancel_reservation",
  anuleaza: "cancel_reservation",
  facturi: "show_invoices",
  calendar: "show_calendar",
  pos: "show_pos",
  stock: "show_stock",
};

// 🔥 Funcția de analiză a mesajului
const analyzeMessage = async (message) => {
  const words = message.toLowerCase().trim().split(/\s+/);
  const firstWord = words[0];

  let intent = quickRoute[firstWord] || null;

  // 📌 Dacă nu găsim o intenție clară, aplicăm NLP
  if (!intent) {
    const classifications = classifier.getClassifications(message.toLowerCase());
    const bestMatch = classifications[0];
    const confidenceThreshold = 0.0009;

    if (!bestMatch || bestMatch.value < confidenceThreshold) {
      console.warn("⚠️ NLP nu este sigur de clasificare:", message);
      return { intent: "unknown_intent", message: intentMessages["unknown_intent"] };
    }

    intent = bestMatch.label;
  }

  // 🔹 Extragem entitățile relevante
  const entities = extractEntities(message);

  // 📌 Gestionăm extra acțiuni
  let extraIntents = [];
  if (intent === "reservation" || intent === "modify_reservation" || intent === "cancel_reservation") {
    extraIntents.push("show_calendar");
  }
  if (intent === "show_pos") {
    extraIntents.push("open_pos");
  }
  if (intent === "show_stock") {
    extraIntents.push("open_stock");
  }

  console.log("📥 Mesaj primit:", message);
  console.log("🎯 Intenție detectată:", intent);
  console.log("📌 Entități extrase:", entities);
  console.log("➕ Acțiuni suplimentare:", extraIntents);

  return { intent, message: intentMessages[intent] || "✅ Comandă procesată!", entities, extraIntents  };
};

module.exports = { analyzeMessage };