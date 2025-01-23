const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService');

// Middleware de validation
const validateSearchParams = (req, res, next) => {
    const params = req.method === 'GET' ? req.query : req.body;
    const { 
        departureAirport,
        arrivalAirport,
        departureDate,
        passengers
    } = params;

    const errors = [];

    // Validation des paramètres requis
    if (!departureAirport) errors.push('Aéroport de départ requis');
    if (!arrivalAirport) errors.push('Aéroport d\'arrivée requis');
    if (!departureDate) errors.push('Date de départ requise');
    
    // Validation du format de la date
    if (departureDate && !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
        errors.push('Format de date invalide. Utilisez YYYY-MM-DD');
    }

    // Validation des passagers
    if (!passengers) {
        errors.push('Informations des passagers requises');
    } else {
        const adults = parseInt(passengers.adults);
        if (isNaN(adults) || adults < 1) {
            errors.push('Au moins 1 adulte requis');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Route de recherche de vols (POST)
router.post('/search', validateSearchParams, async (req, res) => {
    try {
        const searchResult = await amadeusService.searchFlights(req.body);
        res.json({
            success: true,
            data: searchResult
        });
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Une erreur est survenue lors de la recherche de vols',
            details: error.response?.data || error.message
        });
    }
});

// Route de recherche de vols (GET pour les tests)
router.get('/search', validateSearchParams, async (req, res) => {
    try {
        // Convertir les paramètres de la requête au format attendu
        const searchParams = {
            departureAirport: req.query.departureAirport,
            arrivalAirport: req.query.arrivalAirport,
            departureDate: req.query.departureDate,
            passengers: {
                adults: parseInt(req.query.passengers?.adults || '1')
            },
            // Paramètres optionnels
            returnDate: req.query.returnDate,
            travelClass: req.query.travelClass,
            nonStop: req.query.nonStop === 'true'
        };

        const searchResult = await amadeusService.searchFlights(searchParams);
        res.json({
            success: true,
            data: searchResult
        });
    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Une erreur est survenue lors de la recherche de vols',
            details: error.response?.data || error.message
        });
    }
});

// Route de confirmation de prix
router.post('/price-confirmation', async (req, res) => {
    try {
        const { flightOfferId } = req.body;
        
        if (!flightOfferId) {
            return res.status(400).json({ error: 'ID de l\'offre de vol requis' });
        }

        const priceConfirmation = await amadeusService.confirmPrice(flightOfferId);
        res.json(priceConfirmation);
    } catch (error) {
        console.error('Error confirming price:', error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la confirmation du prix',
            details: error.message
        });
    }
});

// Route pour le pricing d'une offre de vol
router.post('/price', async (req, res) => {
    try {
        // Vérifier si l'offre de vol est présente dans le body
        if (!req.body.flightOffer) {
            return res.status(400).json({
                success: false,
                error: 'Offre de vol requise'
            });
        }

        const pricingResult = await amadeusService.priceFlightOffer(req.body.flightOffer);
        res.json({
            success: true,
            data: pricingResult
        });
    } catch (error) {
        console.error('Error pricing flight offer:', error);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Une erreur est survenue lors du pricing du vol',
            details: error.response?.data || error.message
        });
    }
});

module.exports = router;
