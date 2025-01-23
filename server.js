const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import des routes
const reservationRoutes = require('./src/routes/reservationRoutes');
const autocompleteRoutes = require('./src/routes/autocompleteRoutes');
const flightRoutes = require('./src/routes/flightRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/api/flights', flightRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
