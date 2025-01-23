const Reservation = require('../models/Reservation');

class ReservationController {
  static async createReservation(req, res) {
    try {
      const { nom, prenom, email, telephone, flightId } = req.body;
      
      // Validation des données
      if (!nom || !prenom || !email || !telephone || !flightId) {
        return res.status(400).json({
          error: 'Tous les champs sont obligatoires'
        });
      }

      // Vérifier si une réservation existe déjà avec cet email
      const existingReservation = await Reservation.findOne({ where: { email } });
      if (existingReservation) {
        return res.status(400).json({
          error: 'Une réservation existe déjà avec cet email'
        });
      }

      // Créer la réservation
      const reservation = await Reservation.create({
        nom,
        prenom,
        email,
        telephone,
        flightId
      });

      res.status(201).json({
        message: 'Réservation créée avec succès',
        reservation
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({
        error: 'Une erreur est survenue lors de la création de la réservation',
        details: error.message
      });
    }
  }

  static async getAllReservations(req, res) {
    try {
      const reservations = await Reservation.findAll();
      res.json(reservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        error: 'Une erreur est survenue lors de la récupération des réservations'
      });
    }
  }

  static async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findByPk(id);
      
      if (!reservation) {
        return res.status(404).json({
          error: 'Réservation non trouvée'
        });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      res.status(500).json({
        error: 'Une erreur est survenue lors de la récupération de la réservation'
      });
    }
  }
}

module.exports = ReservationController;
