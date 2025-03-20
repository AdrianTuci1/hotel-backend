const express = require("express");
const {
  getAllRoomStatuses,
  getRoomStatusByNumber,
  createRoomStatus,
  updateRoomStatus,
  deleteRoomStatus,
} = require("../controllers/roomStatusController");

const router = express.Router();

// Get all room statuses
router.get("/", getAllRoomStatuses);

// Get room status by room number
router.get("/:roomNumber", getRoomStatusByNumber);

// Create new room status
router.post("/", createRoomStatus);

// Update room status (partial update)
router.patch("/:roomNumber", updateRoomStatus);

// Delete room status
router.delete("/:roomNumber", deleteRoomStatus);

module.exports = router; 