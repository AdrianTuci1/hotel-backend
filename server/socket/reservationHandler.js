const Reservation = require("../models/Reservation");
const { getClients } = require("./webSocket");

// 🔥 Funcție care trimite rezervările active prin WebSocket
const emitReservationsUpdate = async () => {
  try {
    const activeReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"]
      },
      attributes: [
        "id",
        "fullName",
        "phone",
        "email",
        "startDate",
        "endDate",
        "status",
        "rooms",
        "isPaid",
        "hasInvoice",
        "hasReceipt",
        "notes"
      ]
    });

    const formattedReservations = activeReservations.map((res) => ({
      id: res.id,
      fullName: res.fullName,
      phone: res.phone,
      email: res.email,
      startDate: res.startDate,
      endDate: res.endDate,
      status: res.status,
      rooms: res.rooms.map(room => ({
        roomNumber: room.roomNumber,
        type: room.type,
        basePrice: room.basePrice,
        price: room.price,
        startDate: room.startDate || res.startDate,
        endDate: room.endDate || res.endDate,
        status: room.status
      })),
      isPaid: res.isPaid,
      hasInvoice: res.hasInvoice,
      hasReceipt: res.hasReceipt,
      notes: res.notes
    }));

    console.log("📡 Trimit rezervări actualizate prin WebSocket:", formattedReservations);

    const clients = getClients();

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: "active_reservations", 
          reservations: formattedReservations 
        }));
      }
    });
  } catch (error) {
    console.error("❌ Eroare la trimiterea rezervărilor prin WebSocket:", error);
  }
};

// 🔥 Trimite rezervările active către un singur client la conectare
const sendActiveReservations = async (ws) => {
  try {
    const activeReservations = await Reservation.findAll({
      where: {
        status: ["booked", "confirmed"]
      },
      attributes: [
        "id",
        "fullName",
        "phone",
        "email",
        "startDate",
        "endDate",
        "status",
        "rooms",
        "isPaid",
        "hasInvoice",
        "hasReceipt",
        "notes"
      ]
    });

    const formattedReservations = activeReservations.map((res) => ({
      id: res.id,
      fullName: res.fullName,
      phone: res.phone,
      email: res.email,
      startDate: res.startDate,
      endDate: res.endDate,
      status: res.status,
      rooms: res.rooms.map(room => ({
        roomNumber: room.roomNumber,
        type: room.type,
        basePrice: room.basePrice,
        price: room.price,
        startDate: room.startDate || res.startDate,
        endDate: room.endDate || res.endDate,
        status: room.status
      })),
      isPaid: res.isPaid,
      hasInvoice: res.hasInvoice,
      hasReceipt: res.hasReceipt,
      notes: res.notes
    }));

    ws.send(JSON.stringify({ 
      type: "active_reservations", 
      reservations: formattedReservations 
    }));
  } catch (error) {
    console.error("❌ Eroare la obținerea rezervărilor active:", error);
  }
};

module.exports = { emitReservationsUpdate, sendActiveReservations };