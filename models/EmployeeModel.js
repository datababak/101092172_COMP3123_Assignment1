// COMP3123 - Assignment 1
// Employee model

const mongoose = require('mongoose');

// Define the Employee schema
const employeeSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: true
    },

    last_name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        required: true
    },

    date_of_joining: {
        type: Date,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    // Reference to the user who created this employee
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Create and export the Employee model
module.exports = mongoose.model('Employee', employeeSchema);