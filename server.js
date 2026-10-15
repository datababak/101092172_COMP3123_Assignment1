// COMP3123 - Assignment 1
// Employee Management REST API

// Import Express using CommonJS
const express = require('express');

// Create the Express application
const app = express();

// Define the server port
const PORT = 3000;

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});