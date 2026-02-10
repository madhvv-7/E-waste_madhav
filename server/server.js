/**
 * E-Waste Management System - Server Entry Point
 * 
 * Express.js server for handling API requests
 * Handles authentication, pickup requests, agent, recycler, and admin routes
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth')); // Authentication (register, login)
app.use('/api/pickup', require('./routes/pickup')); // User pickup requests
app.use('/api/agent', require('./routes/agent')); // Collection agent routes
app.use('/api/recycler', require('./routes/recycler')); // Recycler routes
app.use('/api/admin', require('./routes/admin')); // Admin routes
app.use('/api/appeals', require('./routes/appeals')); // Appeals (contact requests)

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

