const WebSocket = require("ws");
const { handleChatMessage } = require("./chatHandler");
const { sendActiveReservations, emitReservationsUpdate } = require("./reservationHandler");
const { handleBookingEmail, handleWhatsAppMessage, handlePriceAnalysis } = require("./automationHandler");
const { 
  INCOMING_MESSAGE_TYPES, 
  OUTGOING_MESSAGE_TYPES,
  RESERVATION_ACTIONS,
  AUTOMATION_ACTIONS
} = require("./messageTypes");

let clients = new Set(); // 🔹 Stocăm conexiunile active

// Simulăm verificări periodice pentru automatizări
const startAutomationChecks = (ws) => {
  // Verificare email-uri Booking.com la fiecare 5 minute
  setInterval(() => {
    handleBookingEmail(ws);
  }, 5 * 60 * 1000);

  // Verificare mesaje WhatsApp la fiecare 2 minute
  setInterval(() => {
    handleWhatsAppMessage(ws);
  }, 2 * 60 * 1000);

  // Analiză prețuri zilnică
  setInterval(() => {
    handlePriceAnalysis(ws);
  }, 24 * 60 * 60 * 1000);
};

const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("✅ WebSocket server inițializat pentru /api/chat");

  wss.on("connection", (ws) => {
    console.log("✅ Client WebSocket conectat.");
    clients.add(ws);

    // 🔥 Trimitem rezervările active la fiecare client conectat
    sendActiveReservations(ws);

    // 🔥 Pornim verificările automate pentru acest client
    startAutomationChecks(ws);

    ws.on("message", async (message) => {
      console.log("📩 Mesaj primit:", message);
      try {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
          case INCOMING_MESSAGE_TYPES.CHAT_MESSAGE:
            const response = await handleChatMessage(parsedMessage.content);
            ws.send(JSON.stringify({ 
              type: OUTGOING_MESSAGE_TYPES.CHAT_RESPONSE, 
              response 
            }));
            break;

          case INCOMING_MESSAGE_TYPES.RESERVATION_ACTION:
            console.log(`🔄 Acțiune rezervare: ${parsedMessage.action}`);
            switch (parsedMessage.action) {
              case RESERVATION_ACTIONS.CREATE:
              case RESERVATION_ACTIONS.UPDATE:
              case RESERVATION_ACTIONS.DELETE:
                await emitReservationsUpdate();
                break;
              default:
                console.warn("⚠️ Acțiune rezervare necunoscută:", parsedMessage.action);
                ws.send(JSON.stringify({ 
                  type: OUTGOING_MESSAGE_TYPES.ERROR, 
                  message: "Acțiune rezervare necunoscută" 
                }));
            }
            break;

          case INCOMING_MESSAGE_TYPES.AUTOMATION_ACTION:
            console.log(`🤖 Acțiune automatizare: ${parsedMessage.action}`);
            switch (parsedMessage.action) {
              case AUTOMATION_ACTIONS.BOOKING_EMAIL:
                await handleBookingEmail(ws);
                break;
              case AUTOMATION_ACTIONS.WHATSAPP_MESSAGE:
                await handleWhatsAppMessage(ws);
                break;
              case AUTOMATION_ACTIONS.PRICE_ANALYSIS:
                await handlePriceAnalysis(ws);
                break;
              default:
                console.warn("⚠️ Acțiune automatizare necunoscută:", parsedMessage.action);
                ws.send(JSON.stringify({ 
                  type: OUTGOING_MESSAGE_TYPES.ERROR, 
                  message: "Acțiune automatizare necunoscută" 
                }));
            }
            break;

          default:
            console.warn("⚠️ Tip de mesaj necunoscut:", parsedMessage.type);
            ws.send(JSON.stringify({ 
              type: OUTGOING_MESSAGE_TYPES.ERROR, 
              message: "Tip de mesaj necunoscut" 
            }));
        }
      } catch (error) {
        console.error("❌ Eroare WebSocket:", error);
        ws.send(JSON.stringify({ 
          type: OUTGOING_MESSAGE_TYPES.ERROR, 
          message: "A apărut o eroare la procesarea mesajului" 
        }));
      }
    });

    ws.on("error", (error) => {
      console.error("❌ Eroare conexiune WebSocket:", error);
      clients.delete(ws);
    });

    ws.on("close", () => {
      console.log("🔌 Client WebSocket deconectat.");
      clients.delete(ws);
    });
  });

  return wss;
};

const getClients = () => clients;

// 🔥 Funcție utilă pentru a notifica toți clienții despre schimbări în rezervări
const notifyReservationChange = async () => {
  await emitReservationsUpdate();
};

module.exports = { initSocket, getClients, notifyReservationChange };