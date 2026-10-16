// COMP3123 - Assignment 1
// JWT Authentication Middleware

const jwt = require('jsonwebtoken');

// Middleware to verify JWT authentication
const authMiddleware = (req, res, next) => {

    // Read the Authorization header
    const authHeader = req.headers.authorization;

    // Check whether the Bearer token was provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Authentication token is required"
        });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication token is required"
        });
    }

    try {

        // Verify the JWT using our secret key
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store the authenticated user's ID in the request
        req.user = {
            id: decoded.id
        };

        // Continue to the next middleware or route
        next();

    } catch (error) {

        // Check whether the token has expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Authentication token has expired"
            });
        }

        // Handle invalid tokens
        return res.status(401).json({
            message: "Invalid authentication token"
        });

    }
};

// Export the middleware
module.exports = authMiddleware;