// COMP3123 - Assignment 1
// Employee Management REST API

// Import Express using CommonJS
const express = require('express');

// Load environment variables
require('dotenv').config();

// Import MongoDB connection function
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/UserRoutes');
const employeeRoutes = require('./routes/EmployeeRoutes');

// Import security packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import Middleware for error handling
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Create the Express application
const app = express();

// Define the server port
const PORT = process.env.PORT || 3000;

// Middleware to read JSON data from requests
app.use(express.json());



// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Add security-related HTTP response headers
app.use(helmet());

// =====================================================
// REQUEST LOGGING WITH MORGAN
// =====================================================

const fs = require('fs');
const path = require('path');

// Create logs directory if it does not exist
const logsDirectory = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
}

// Create a stream to write logs to a file
const accessLogStream = fs.createWriteStream(
    path.join(logsDirectory, 'access.log'),
    { flags: 'a' }
);

// Log requests to the terminal
app.use(morgan('dev'));

// Log requests to logs/access.log
app.use(morgan('combined', {
    stream: accessLogStream
}));


// Limit each IP address to 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);


// Limit login attempts to 10 requests per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});

// Apply the stricter limit to login requests
app.use('/api/v1/user/login', loginLimiter);







//------routes
// API routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

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

// Handle unknown endpoints
app.use(notFound);

// Handle errors passed to Express
app.use(errorHandler);

// Connect to MongoDB before starting the server
const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });

};

startServer();