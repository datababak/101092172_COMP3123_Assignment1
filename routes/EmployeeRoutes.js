// COMP3123 - Assignment 1
// Employee API Routes

const express = require('express');
const router = express.Router();

// Import authentication middleware
const authMiddleware = require('../middleware/authMiddleware');

// Import Employee Controller functions
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require('../controllers/EmployeeController');


// =====================================================
// PROTECT ALL EMPLOYEE ROUTES
// =====================================================

// Every employee request must contain a valid JWT
router.use(authMiddleware);


// =====================================================
// EMPLOYEE CRUD ROUTES
// =====================================================

// CREATE - Add a new employee
router.post('/employees', createEmployee);

// READ - Get all employees belonging to logged-in user
router.get('/employees', getAllEmployees);

// READ - Get one employee by ID
router.get('/employees/:eid', getEmployeeById);

// UPDATE - Modify an existing employee
router.put('/employees/:eid', updateEmployee);

// DELETE - Remove an employee using query parameter
router.delete('/employees', deleteEmployee);


// Export router
module.exports = router;