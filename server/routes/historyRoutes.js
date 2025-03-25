const express = require('express');
const router = express.Router();
const { getMessageHistory } = require('../controllers/historyController');
const { authenticateToken } = require('../middleware/auth');

// Ruta pentru obținerea istoricului mesajelor
router.get('/', authenticateToken, getMessageHistory);

module.exports = router; 