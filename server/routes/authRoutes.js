const express = require('express');
const router = express.Router();
const {
  register,
  login,
  gmailLogin,
  registerPasskey,
  loginPasskey,
  verifyEmail,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');

// Rute pentru autentificare
router.post('/register', register);                    // POST /api/auth/register
router.post('/login', login);                         // POST /api/auth/login
router.post('/gmail', gmailLogin);                    // POST /api/auth/gmail
router.post('/passkey/register', registerPasskey);    // POST /api/auth/passkey/register
router.post('/passkey/login', loginPasskey);          // POST /api/auth/passkey/login
router.get('/verify-email/:token', verifyEmail);      // GET /api/auth/verify-email/:token
router.post('/forgot-password', requestPasswordReset);// POST /api/auth/forgot-password
router.post('/reset-password', resetPassword);        // POST /api/auth/reset-password

module.exports = router; 