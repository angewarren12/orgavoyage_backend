const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import des routes
const autocompleteRoutes = require('./src/routes/autocompleteRoutes');
const flightRoutes = require('./src/routes/flightRoutes');

const app = express();

// Configuration CORS
const corsOptions = {
  origin: ['https://orgavoyages.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/api/flights', flightRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
