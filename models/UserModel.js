// COMP3123 - Assignment 1
// User model for registration and authentication

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);