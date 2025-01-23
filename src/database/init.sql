-- Création de la base de données
CREATE DATABASE IF NOT EXISTS voyage_db;
USE voyage_db;

-- Table des réservations
CREATE TABLE IF NOT EXISTS Reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    flightId VARCHAR(100) NOT NULL,  -- Modifié pour stocker l'ID du vol de l'API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email_per_flight (email, flightId)
);

-- Index pour améliorer les performances des recherches
CREATE INDEX idx_email ON Reservations(email);
CREATE INDEX idx_flight_id ON Reservations(flightId);
