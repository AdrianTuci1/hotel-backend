const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// Rute pentru facturi
router.get('/', authenticateToken, getAllInvoices);           // GET /api/invoices
router.post('/', authenticateToken, createInvoice);          // POST /api/invoices
router.put('/:id', authenticateToken, updateInvoice);        // PUT /api/invoices/:id
router.delete('/:id', authenticateToken, deleteInvoice);     // DELETE /api/invoices/:id

module.exports = router; 