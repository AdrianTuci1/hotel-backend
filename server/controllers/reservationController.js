const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { emitReservationsUpdate } = require("../socket");
const { addToHistory } = require('../utils/historyHelper');

const createReservation = async (req, res) => {
  try {
    const { 
      fullName, 
      phone, 
      email, 
      existingClientId, 
      startDate, 
      endDate, 
      status = "booked",
      rooms,
      isPaid = false,
      hasInvoice = false,
      hasReceipt = false,
      notes 
    } = req.body;


    // Validare date de bază
    if (!fullName || !startDate || !endDate || !rooms || !Array.isArray(rooms)) {
      return res.status(400).json({ 
        message: "❌ Date incomplete pentru rezervare.",
        required: ["fullName", "startDate", "endDate", "rooms[]"]
      });
    }

    // Validare camere și completare date lipsă
    const validatedRooms = await Promise.all(rooms.map(async room => {
      // Verificăm dacă camera există
      const existingRoom = await Room.findOne({ where: { number: room.roomNumber } });
      if (!existingRoom) {
        throw new Error(`Camera ${room.roomNumber} nu există.`);
      }

      // Construim obiectul pentru camera rezervării
      return {
        roomNumber: room.roomNumber,
        type: room.type || existingRoom.type,
        basePrice: room.basePrice || existingRoom.price,
        price: room.price || existingRoom.price,
        startDate: room.startDate || startDate,
        endDate: room.endDate || endDate,
        status: room.status || "pending"
      };
    }));

    // Creare rezervare cu toate datele
    const reservation = await Reservation.create({
      fullName,
      phone,
      email,
      existingClientId,
      startDate,
      endDate,
      status,
      rooms: validatedRooms,
      isPaid,
      hasInvoice,
      hasReceipt,
      notes
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'RESERVATION',
      action: 'CREATE',
      content: reservation,
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    // Formatăm răspunsul în același format ca în WebSocket
    const formattedReservation = {
      id: reservation.id,
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      status: reservation.status,
      rooms: reservation.rooms.map(room => ({
        roomNumber: room.roomNumber,
        type: room.type,
        basePrice: room.basePrice,
        price: room.price,
        startDate: room.startDate || reservation.startDate,
        endDate: room.endDate || reservation.endDate,
        status: room.status
      })),
      isPaid: reservation.isPaid,
      hasInvoice: reservation.hasInvoice,
      hasReceipt: reservation.hasReceipt,
      notes: reservation.notes
    };

    // Emitere prin WebSocket către toți clienții conectați
    emitReservationsUpdate();

    res.json({
      message: `✅ Rezervare înregistrată pentru ${fullName}`,
      reservation: formattedReservation
    });
  } catch (error) {
    console.error("❌ Eroare la crearea rezervării:", error);
    res.status(error.message.includes("Camera") ? 404 : 500).json({ 
      message: error.message || "❌ Eroare internă la crearea rezervării." 
    });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fullName, 
      phone, 
      email, 
      existingClientId, 
      startDate, 
      endDate, 
      status,
      rooms,
      isPaid,
      hasInvoice,
      hasReceipt,
      notes 
    } = req.body;

    // Verificăm dacă rezervarea există
    const existingReservation = await Reservation.findByPk(id);
    if (!existingReservation) {
      return res.status(404).json({ message: "❌ Rezervarea nu a fost găsită." });
    }

    // Dacă sunt specificate camere noi, le validăm
    let validatedRooms = existingReservation.rooms;
    if (rooms && Array.isArray(rooms)) {
      validatedRooms = await Promise.all(rooms.map(async room => {
        const existingRoom = await Room.findOne({ where: { number: room.roomNumber } });
        if (!existingRoom) {
          throw new Error(`Camera ${room.roomNumber} nu există.`);
        }

        return {
          roomNumber: room.roomNumber,
          type: room.type || existingRoom.type,
          basePrice: room.basePrice || existingRoom.price,
          price: room.price || existingRoom.price,
          startDate: room.startDate || startDate || existingReservation.startDate,
          endDate: room.endDate || endDate || existingReservation.endDate,
          status: room.status || existingReservation.status
        };
      }));
    }

    // Actualizăm rezervarea
    await existingReservation.update({
      fullName: fullName || existingReservation.fullName,
      phone: phone || existingReservation.phone,
      email: email || existingReservation.email,
      existingClientId: existingClientId || existingReservation.existingClientId,
      startDate: startDate || existingReservation.startDate,
      endDate: endDate || existingReservation.endDate,
      status: status || existingReservation.status,
      rooms: validatedRooms,
      isPaid: isPaid !== undefined ? isPaid : existingReservation.isPaid,
      hasInvoice: hasInvoice !== undefined ? hasInvoice : existingReservation.hasInvoice,
      hasReceipt: hasReceipt !== undefined ? hasReceipt : existingReservation.hasReceipt,
      notes: notes || existingReservation.notes
    });

    // Reîncărcăm rezervarea pentru a obține datele actualizate
    const updatedReservation = await Reservation.findByPk(id);

    // Adăugăm în istoric
    await addToHistory({
      type: 'RESERVATION',
      action: 'UPDATE',
      content: {
        old: existingReservation.toJSON(),
        new: updatedReservation.toJSON()
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        reservationId: id
      }
    });

    // Formatăm răspunsul
    const formattedReservation = {
      id: updatedReservation.id,
      fullName: updatedReservation.fullName,
      phone: updatedReservation.phone,
      email: updatedReservation.email,
      startDate: updatedReservation.startDate,
      endDate: updatedReservation.endDate,
      status: updatedReservation.status,
      rooms: updatedReservation.rooms.map(room => ({
        roomNumber: room.roomNumber,
        type: room.type,
        basePrice: room.basePrice,
        price: room.price,
        startDate: room.startDate || updatedReservation.startDate,
        endDate: room.endDate || updatedReservation.endDate,
        status: room.status
      })),
      isPaid: updatedReservation.isPaid,
      hasInvoice: updatedReservation.hasInvoice,
      hasReceipt: updatedReservation.hasReceipt,
      notes: updatedReservation.notes
    };

    // Emitem actualizarea prin WebSocket
    emitReservationsUpdate();

    res.json({
      message: `✅ Rezervare actualizată pentru ${formattedReservation.fullName}`,
      reservation: formattedReservation
    });
  } catch (error) {
    console.error("❌ Eroare la actualizarea rezervării:", error);
    res.status(error.message.includes("Camera") ? 404 : 500).json({ 
      message: error.message || "❌ Eroare internă la actualizarea rezervării." 
    });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificăm dacă rezervarea există
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: "❌ Rezervarea nu a fost găsită." });
    }

    // Salvăm datele pentru istoric înainte de ștergere
    const reservationData = reservation.toJSON();

    // Ștergem rezervarea
    await reservation.destroy();

    // Adăugăm în istoric
    await addToHistory({
      type: 'RESERVATION',
      action: 'DELETE',
      content: reservationData,
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        reservationId: id
      }
    });

    // Emitem actualizarea prin WebSocket
    emitReservationsUpdate();

    res.json({ 
      message: `✅ Rezervarea pentru ${reservation.fullName} a fost ștearsă cu succes.`,
      deletedId: id
    });
  } catch (error) {
    console.error("❌ Eroare la ștergerea rezervării:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la ștergerea rezervării." 
    });
  }
};

module.exports = { 
  createReservation,
  updateReservation,
  deleteReservation
};