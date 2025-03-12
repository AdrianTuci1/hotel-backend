const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { emitReservationsUpdate } = require("../socket/reservationHandler");

const createReservation = async (req, res) => {
  try {
    const { 
      fullName, 
      phone, 
      email, 
      existingClientId, 
      startDate, 
      endDate, 
      rooms, 
      notes 
    } = req.body;

    // Validare date de bază
    if (!fullName || !phone || !email || !startDate || !endDate || !rooms || !Array.isArray(rooms)) {
      return res.status(400).json({ message: "❌ Date incomplete pentru rezervare." });
    }

    // Validare camere
    for (const room of rooms) {
      const existingRoom = await Room.findOne({ where: { number: room.roomNumber } });
      if (!existingRoom) {
        return res.status(404).json({ 
          message: `❌ Camera ${room.roomNumber} nu există.` 
        });
      }
      // Setăm tipul și prețul de bază din baza de date
      room.type = existingRoom.type;
      room.basePrice = existingRoom.price;
      // Dacă nu este specificat un preț special, folosim prețul de bază
      if (!room.price) {
        room.price = room.basePrice;
      }
      // Setăm datele pentru cameră dacă nu sunt specificate
      room.startDate = room.startDate || startDate;
      room.endDate = room.endDate || endDate;
      room.status = room.status || "pending";
    }

    // Creare rezervare cu toate datele
    const reservation = await Reservation.create({
      fullName,
      phone,
      email,
      existingClientId,
      startDate,
      endDate,
      status: "booked",
      rooms,
      notes
    });

    // Emitere prin WebSocket către toți clienții conectați
    emitReservationsUpdate();

    res.json({
      message: `✅ Rezervare înregistrată pentru ${fullName}`,
      reservation
    });
  } catch (error) {
    console.error("❌ Eroare la crearea rezervării:", error);
    res.status(500).json({ message: "❌ Eroare internă la crearea rezervării." });
  }
};

module.exports = { createReservation };