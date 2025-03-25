const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

// Rute pentru camere
router.get('/', authenticateToken, getAllRooms);           // GET /api/rooms
router.post('/', authenticateToken, createRoom);           // POST /api/rooms
router.put('/:number', authenticateToken, updateRoom);     // PUT /api/rooms/:number
router.delete('/:number', authenticateToken, deleteRoom);  // DELETE /api/rooms/:number

module.exports = router; 