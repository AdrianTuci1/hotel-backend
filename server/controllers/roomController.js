const Room = require("../models/Room");

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

module.exports = { getAllRooms };