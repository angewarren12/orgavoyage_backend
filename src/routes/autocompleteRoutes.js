const express = require('express');
const router = express.Router();
const amadeusService = require('../services/amadeusService');

// Route pour la recherche d'aéroports
router.get('/airports', async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({ error: 'Le mot-clé doit contenir au moins 2 caractères' });
        }
        const airports = await amadeusService.searchAirports(keyword);
        res.json(airports);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche des aéroports' });
    }
});

// Route pour la recherche de compagnies aériennes
router.get('/airlines', async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.length < 2) {
            return res.status(400).json({ error: 'Le mot-clé doit contenir au moins 2 caractères' });
        }
        const airlines = await amadeusService.searchAirlines(keyword);
        res.json(airlines);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche des compagnies aériennes' });
    }
});

module.exports = router;
