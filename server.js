// COMP3123 - Assignment 1
// Employee Management REST API

// Import Express using CommonJS
const express = require('express');

// Load environment variables
require('dotenv').config();

// Import MongoDB connection function
const connectDB = require('./config/db');

// Create the Express application
const app = express();

// Define the server port
const PORT = process.env.PORT || 3000;

// Middleware to read JSON data from requests
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to Employee Management API"
    });
});

// Health check endpoint
// GET /health
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Employee Management API is running"
    });
});

// Connect to MongoDB before starting the server
const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

};

startServer();