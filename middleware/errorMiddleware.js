// COMP3123 - Assignment 1
// Centralized Error Handling

// Handle unknown routes
const notFound = (req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
};

// Handle application errors
const errorHandler = (err, req, res, next) => {

    console.error("Application error:", err.message);

    // Handle invalid JSON request bodies
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    // Use the error status, or default to 500
    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).json({
        message: statusCode === 500
            ? "Internal server error"
            : err.message
    });
};

module.exports = { notFound, errorHandler };