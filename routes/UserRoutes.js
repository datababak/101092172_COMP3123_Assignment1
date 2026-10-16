// COMP3123 - Assignment 1
// User API routes

const express = require('express');
const router = express.Router();

// Import user controller functions
const { signup, login } = require('../controllers/UserController');

// User registration
router.post('/signup', signup);

// User login
router.post('/login', login);

// Export router
module.exports = router;