const RoomStatus = require("../models/RoomStatus");

// Get all room statuses
const getAllRoomStatuses = async (req, res) => {
  try {
    const roomStatuses = await RoomStatus.findAll({
      order: [["roomNumber", "ASC"]],
    });
    res.json(roomStatuses);
  } catch (error) {
    console.error("❌ Error getting room statuses:", error);
    res.status(500).json({ message: "❌ Internal error getting room statuses." });
  }
};

// Get room status by room number
const getRoomStatusByNumber = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const roomStatus = await RoomStatus.findOne({
      where: { roomNumber },
    });

    if (!roomStatus) {
      return res.status(404).json({ message: "❌ Room status not found." });
    }

    res.json(roomStatus);
  } catch (error) {
    console.error("❌ Error getting room status:", error);
    res.status(500).json({ message: "❌ Internal error getting room status." });
  }
};

// Create new room status
const createRoomStatus = async (req, res) => {
  try {
    const { roomNumber, isClean, hasProblems, problem } = req.body;

    const existingStatus = await RoomStatus.findOne({
      where: { roomNumber },
    });

    if (existingStatus) {
      return res.status(400).json({ message: "❌ Room status already exists." });
    }

    const roomStatus = await RoomStatus.create({
      roomNumber,
      isClean,
      hasProblems,
      problem,
    });

    res.status(201).json(roomStatus);
  } catch (error) {
    console.error("❌ Error creating room status:", error);
    res.status(500).json({ message: "❌ Internal error creating room status." });
  }
};

// Update room status
const updateRoomStatus = async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { isClean, hasProblems, problem } = req.body;

    const roomStatus = await RoomStatus.findOne({
      where: { roomNumber },
    });

    if (!roomStatus) {
      return res.status(404).json({ message: "❌ Room status not found." });
    }

    await roomStatus.update({
      isClean,
      hasProblems,
      problem,
    });

    res.json(roomStatus);
  } catch (error) {
    console.error("❌ Error updating room status:", error);
    res.status(500).json({ message: "❌ Internal error updating room status." });
  }
};

// Delete room status
const deleteRoomStatus = async (req, res) => {
  try {
    const { roomNumber } = req.params;

    const roomStatus = await RoomStatus.findOne({
      where: { roomNumber },
    });

    if (!roomStatus) {
      return res.status(404).json({ message: "❌ Room status not found." });
    }

    await roomStatus.destroy();
    res.json({ message: "✅ Room status deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting room status:", error);
    res.status(500).json({ message: "❌ Internal error deleting room status." });
  }
};

module.exports = {
  getAllRoomStatuses,
  getRoomStatusByNumber,
  createRoomStatus,
  updateRoomStatus,
  deleteRoomStatus,
}; 