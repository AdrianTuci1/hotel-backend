const { Room } = require("../models");
const { addToHistory } = require('../utils/historyHelper');

// Obține toate camerele
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      attributes: ["number", "type", "price"],
      order: [["number", "ASC"]], // 📌 Sortăm camerele după număr
    });

    res.json(rooms);
  } catch (error) {
    console.error("❌ Eroare la obținerea camerelor:", error);
    res.status(500).json({ message: "❌ Eroare internă la obținerea camerelor." });
  }
};

// Creează o cameră nouă
const createRoom = async (req, res) => {
  try {
    const { number, type, price } = req.body;

    // Validare date de bază
    if (!number || !type || !price) {
      return res.status(400).json({ 
        message: "❌ Date incomplete pentru cameră.",
        required: ["number", "type", "price"]
      });
    }

    // Verificăm dacă camera există deja
    const existingRoom = await Room.findOne({ where: { number } });
    if (existingRoom) {
      return res.status(400).json({ 
        message: `❌ Camera cu numărul ${number} există deja.` 
      });
    }

    // Creăm camera
    const room = await Room.create({
      number,
      type,
      price
    });

    // Adăugăm în istoric
    await addToHistory({
      type: 'ROOM',
      action: 'CREATE',
      content: room,
      metadata: {
        userId: req.user.id,
        userName: req.user.name
      }
    });

    res.status(201).json({
      message: `✅ Camera ${number} a fost creată cu succes.`,
      room
    });
  } catch (error) {
    console.error("❌ Eroare la crearea camerei:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la crearea camerei." 
    });
  }
};

// Actualizează o cameră existentă
const updateRoom = async (req, res) => {
  try {
    const { number } = req.params;
    const { type, price } = req.body;

    // Verificăm dacă camera există
    const existingRoom = await Room.findOne({ where: { number } });
    if (!existingRoom) {
      return res.status(404).json({ 
        message: `❌ Camera cu numărul ${number} nu a fost găsită.` 
      });
    }

    // Salvăm datele vechi pentru istoric
    const oldData = existingRoom.toJSON();

    // Actualizăm camera
    await existingRoom.update({
      type: type || existingRoom.type,
      price: price || existingRoom.price
    });

    // Reîncărcăm camera pentru a obține datele actualizate
    const updatedRoom = await Room.findOne({ where: { number } });

    // Adăugăm în istoric
    await addToHistory({
      type: 'ROOM',
      action: 'UPDATE',
      content: {
        old: oldData,
        new: updatedRoom.toJSON()
      },
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        roomNumber: number
      }
    });

    res.json({
      message: `✅ Camera ${number} a fost actualizată cu succes.`,
      room: updatedRoom
    });
  } catch (error) {
    console.error("❌ Eroare la actualizarea camerei:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la actualizarea camerei." 
    });
  }
};

// Șterge o cameră
const deleteRoom = async (req, res) => {
  try {
    const { number } = req.params;

    // Verificăm dacă camera există
    const room = await Room.findOne({ where: { number } });
    if (!room) {
      return res.status(404).json({ 
        message: `❌ Camera cu numărul ${number} nu a fost găsită.` 
      });
    }

    // Salvăm datele pentru istoric înainte de ștergere
    const roomData = room.toJSON();

    // Ștergem camera
    await room.destroy();

    // Adăugăm în istoric
    await addToHistory({
      type: 'ROOM',
      action: 'DELETE',
      content: roomData,
      metadata: {
        userId: req.user.id,
        userName: req.user.name,
        roomNumber: number
      }
    });

    res.json({ 
      message: `✅ Camera ${number} a fost ștearsă cu succes.`,
      deletedNumber: number
    });
  } catch (error) {
    console.error("❌ Eroare la ștergerea camerei:", error);
    res.status(500).json({ 
      message: "❌ Eroare internă la ștergerea camerei." 
    });
  }
};

module.exports = { 
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom
};