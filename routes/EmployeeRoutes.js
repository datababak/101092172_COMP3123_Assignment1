// COMP3123 - Assignment 1
// Employee API routes

const express = require('express');
const router = express.Router();

// Import JWT authentication middleware
const authMiddleware = require('../middleware/authMiddleware');

// Protect all employee routes
router.use(authMiddleware);

// Temporary endpoint to test authentication
router.get('/employees', (req, res) => {

    res.status(200).json({
        message: "Employee route authentication successful",
        userId: req.user.id
    });

});

// Export the router
module.exports = router;