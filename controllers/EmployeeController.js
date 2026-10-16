// COMP3123 - Assignment 1
// Employee Controller
// CRUD operations with input validation and user ownership protection

const Employee = require('../models/EmployeeModel');


// =====================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================

// Fields that users are allowed to provide or update
const allowedFields = [
    'first_name',
    'last_name',
    'email',
    'position',
    'salary',
    'date_of_joining',
    'department'
];


// Check whether a value is text within the required length
const isValidText = (value, minLength, maxLength) => {
    return typeof value === 'string' &&
        value.trim().length >= minLength &&
        value.trim().length <= maxLength;
};


// Check whether an email address has a valid format
const isValidEmail = (email) => {
    return typeof email === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


// Check whether a date is valid and uses YYYY-MM-DD format
const isValidDate = (date) => {

    if (typeof date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return false;
    }

    // Reject dates such as 2025-02-30
    return parsedDate.toISOString().slice(0, 10) === date;
};


// Validate employee information
// isUpdate = false: all fields are required
// isUpdate = true: validate only the fields being updated
const validateEmployee = (data, isUpdate = false) => {

    // The request body must be a JSON object
    if (!data || typeof data !== 'object' ||
        Array.isArray(data)) {

        return "Employee information must be a JSON object";
    }

    const fields = Object.keys(data);

    // Reject unsupported fields, including attempts to change ownership
    for (const field of fields) {

        if (!allowedFields.includes(field)) {
            return "Invalid employee field: " + field;
        }
    }

    // POST requires all seven employee fields
    if (!isUpdate) {

        for (const field of allowedFields) {

            if (data[field] === undefined ||
                data[field] === null ||
                data[field] === '') {

                return "All employee fields are required";
            }
        }
    }

    // PUT must contain at least one field
    if (isUpdate && fields.length === 0) {
        return "At least one field is required for updating";
    }

    // First name
    if (data.first_name !== undefined &&
        !isValidText(data.first_name, 2, 50)) {

        return "First name must contain 2 to 50 characters";
    }

    // Last name
    if (data.last_name !== undefined &&
        !isValidText(data.last_name, 2, 50)) {

        return "Last name must contain 2 to 50 characters";
    }

    // Email
    if (data.email !== undefined &&
        !isValidEmail(data.email)) {

        return "Please enter a valid employee email address";
    }

    // Position
    if (data.position !== undefined &&
        !isValidText(data.position, 2, 100)) {

        return "Position must contain 2 to 100 characters";
    }

    // Salary
    if (data.salary !== undefined) {

        if (typeof data.salary !== 'number' ||
            !Number.isFinite(data.salary) ||
            data.salary <= 0) {

            return "Salary must be a positive number";
        }
    }

    // Joining date
    if (data.date_of_joining !== undefined &&
        !isValidDate(data.date_of_joining)) {

        return "Date of joining must be a valid date in YYYY-MM-DD format";
    }

    // Department
    if (data.department !== undefined &&
        !isValidText(data.department, 2, 100)) {

        return "Department must contain 2 to 100 characters";
    }

    // No validation errors
    return null;
};


// =====================================================
// 1. CREATE EMPLOYEE (POST)
// =====================================================

const createEmployee = async (req, res) => {

    try {

        // Validate all required employee information
        const validationError = validateEmployee(req.body);

        if (validationError) {

            return res.status(400).json({
                message: validationError
            });
        }

        const {
            first_name,
            last_name,
            email,
            position,
            salary,
            date_of_joining,
            department
        } = req.body;

        // Employee ownership always comes from the verified JWT
        const newEmployee = new Employee({
            first_name: first_name,
            last_name: last_name,
            email: email,
            position: position,
            salary: salary,
            date_of_joining: date_of_joining,
            department: department,
            user: req.user.id
        });

        await newEmployee.save();

        res.status(201).json({
            message: "Employee created successfully",
            employee: newEmployee
        });

    } catch (error) {

        if (error.name === 'ValidationError' ||
            error.name === 'CastError') {

            return res.status(400).json({
                message: "Invalid employee information"
            });
        }

        console.log("Create employee error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =====================================================
// 2. GET ALL EMPLOYEES (GET)
// =====================================================

const getAllEmployees = async (req, res) => {

    try {

        // Return only employees belonging to the logged-in user
        const employees = await Employee.find({
            user: req.user.id
        });

        res.status(200).json({
            message: "Employees retrieved successfully",
            employees: employees
        });

    } catch (error) {

        console.log("Get employees error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =====================================================
// 3. GET EMPLOYEE BY ID (GET)
// =====================================================

const getEmployeeById = async (req, res) => {

    try {

        const employeeId = req.params.eid;

        // Validate the MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(employeeId)) {

            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Search using both employee ID and authenticated user ID
        const employee = await Employee.findOne({
            _id: employeeId,
            user: req.user.id
        });

        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee retrieved successfully",
            employee: employee
        });

    } catch (error) {

        console.log("Get employee error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =====================================================
// 4. UPDATE EMPLOYEE (PUT)
// =====================================================

const updateEmployee = async (req, res) => {

    try {

        const employeeId = req.params.eid;

        // Validate employee ID
        if (!/^[0-9a-fA-F]{24}$/.test(employeeId)) {

            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Validate only the fields supplied for updating
        const validationError = validateEmployee(req.body, true);

        if (validationError) {

            return res.status(400).json({
                message: validationError
            });
        }

        // Create an object containing the validated updates
        const updates = {};

        for (const field of allowedFields) {

            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Update only an employee owned by the logged-in user
        const employee = await Employee.findOneAndUpdate(
            {
                _id: employeeId,
                user: req.user.id
            },
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee: employee
        });

    } catch (error) {

        if (error.name === 'ValidationError' ||
            error.name === 'CastError') {

            return res.status(400).json({
                message: "Invalid employee information"
            });
        }

        console.log("Update employee error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =====================================================
// 5. DELETE EMPLOYEE (DELETE)
// =====================================================

const deleteEmployee = async (req, res) => {

    try {

        // Assignment specifies the employee ID as a query parameter
        const employeeId = req.query.eid;

        // Validate employee ID
        if (typeof employeeId !== 'string' ||
            !/^[0-9a-fA-F]{24}$/.test(employeeId)) {

            return res.status(400).json({
                message: "Invalid or missing employee ID"
            });
        }

        // Delete only an employee owned by the logged-in user
        const employee = await Employee.findOneAndDelete({
            _id: employeeId,
            user: req.user.id
        });

        if (!employee) {

            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // Successful deletion without a response body
        res.status(204).send();

    } catch (error) {

        console.log("Delete employee error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};