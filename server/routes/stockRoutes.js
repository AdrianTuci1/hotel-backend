const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllStock,
  createStockItem,
  updateStockItem,
  deleteStockItem
} = require('../controllers/stockController');

// Rute pentru stoc
router.get('/', authenticateToken, getAllStock);           // GET /api/stock
router.post('/', authenticateToken, createStockItem);      // POST /api/stock
router.put('/:id', authenticateToken, updateStockItem);    // PUT /api/stock/:id
router.delete('/:id', authenticateToken, deleteStockItem); // DELETE /api/stock/:id

module.exports = router; 