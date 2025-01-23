const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService');

router.get('/search', async (req, res) => {
    try {
        const { cityName } = req.query;

        if (!cityName) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de la ville est requis'
            });
        }

        const result = await amadeusService.searchHotels(cityName);
        res.json(result);
    } catch (error) {
        console.error('Error in hotel search route:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recherche des hôtels'
        });
    }
});

router.get('/random', async (req, res) => {
    try {
        const result = await amadeusService.getRandomHotels();
        res.json(result);
    } catch (error) {
        console.error('Error in random hotels route:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des hôtels'
        });
    }
});

module.exports = router;
