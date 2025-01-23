const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const autocompleteRoutes = require('./routes/autocompleteRoutes');
const flightRoutes = require('./routes/flightRoutes');
const hotelRoutes = require('./routes/hotelRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
