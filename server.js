const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./src/config/database');

// Import des routes
const reservationRoutes = require('./src/routes/reservationRoutes');
const autocompleteRoutes = require('./src/routes/autocompleteRoutes');
const flightRoutes = require('./src/routes/flightRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/api/flights', flightRoutes);

// Synchronisation de la base de données
sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de synchronisation de la base de données:', err);
  });
