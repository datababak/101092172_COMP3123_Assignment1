// COMP3123 - Assignment 1
// MongoDB database connection

const mongoose = require('mongoose');

// Function to connect to MongoDB Atlas
const connectDB = async () => {

    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");

    } catch (error) {

        console.log("MongoDB connection failed:", error.message);

        process.exit(1);
    }
};

// Export the function so server.js can use it
module.exports = connectDB;