const express = require("express");
const router = express.Router();
const { 
  createReservation,
  updateReservation,
  deleteReservation
} = require("../controllers/reservationController");

// Creare rezervare nouă
router.post("/", createReservation);

// Actualizare rezervare existentă
router.put("/:id", updateReservation);

// Ștergere rezervare
router.delete("/:id", deleteReservation);

module.exports = router;