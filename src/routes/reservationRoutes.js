const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/ReservationController');

// Créer une nouvelle réservation
router.post('/', ReservationController.createReservation);

// Récupérer toutes les réservations
router.get('/', ReservationController.getAllReservations);

// Récupérer une réservation par son ID
router.get('/:id', ReservationController.getReservationById);

module.exports = router;
