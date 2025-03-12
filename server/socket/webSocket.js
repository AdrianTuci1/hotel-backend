const WebSocket = require("ws");
const { handleChatMessage } = require("./chatHandler");
const { sendActiveReservations, emitReservationsUpdate } = require("./reservationHandler");

let clients = new Set(); // 🔹 Stocăm conexiunile active

const initSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("✅ WebSocket server inițializat pentru /api/chat");

  wss.on("connection", (ws) => {
    console.log("✅ Client WebSocket conectat.");
    clients.add(ws);

    // 🔥 Trimitem rezervările active la fiecare client conectat
    sendActiveReservations(ws);

    ws.on("message", async (message) => {
      console.log("📩 Mesaj primit:", message);
      try {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "chat_message") {
          const response = await handleChatMessage(parsedMessage.content);
          ws.send(JSON.stringify({ type: "chat_response", response }));
        } else if (parsedMessage.type === "reservation_update") {
          // 🔥 Când primim o actualizare de rezervare, notificăm toți clienții
          await emitReservationsUpdate();
        }
      } catch (error) {
        console.error("❌ Eroare WebSocket:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
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