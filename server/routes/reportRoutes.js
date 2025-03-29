const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getSalesReport } = require('../controllers/reportController');

// Rută pentru raportul de vânzări
router.get('/sales', authenticateToken, getSalesReport);           // GET /api/reports/sales

module.exports = router; 