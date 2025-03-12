require("dotenv").config();
const express = require("express");
const http = require("http");
const { initSocket } = require("./socket/webSocket");
const cors = require("cors");
const { syncDB } = require("./db");
const url = require("url");
const reservationRoutes = require('./routes/reservations');
const roomRoutes = require('./routes/rooms');

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ["http://localhost:5173"], // ✅ Schimbă dacă frontend-ul rulează pe alt port
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());


app.use("/api/reservations", reservationRoutes);
app.use("/api/rooms", roomRoutes);



const PORT = process.env.PORT || 5000;


// ✅ Inițializăm baza de date și WebSocket Server
syncDB().then(() => {
  const wss = initSocket(server); // 🔹 Inițializăm WebSocket

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = url.parse(request.url, true);

    // ✅ Acceptăm doar conexiunile WebSocket pe /api/chat
    if (pathname === "/api/chat") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});