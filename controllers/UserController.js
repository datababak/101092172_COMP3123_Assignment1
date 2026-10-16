// COMP3123 - Assignment 1
// User registration controller

const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
const signup = async (req, res) => {

    try {

        // Read user information from the request body
        const { username, email, password } = req.body;

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        // Validate username
        if (typeof username !== 'string' ||
            username.length < 3 ||
            username.length > 30) {

            return res.status(400).json({
                message: "Username must contain 3 to 30 characters"
            });
        }

        // Validate email
        if (typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        // Validate password
        if (typeof password !== 'string' ||
            password.length < 8 ||
            password.length > 72) {

            return res.status(400).json({
                message: "Password must contain 8 to 72 characters"
            });
        }

        // Check whether username or email already exists
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        // Save user to MongoDB
        await newUser.save();

        // Return successful response
        // Never return the password or its hash
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {

        // Handle duplicate-key errors from MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        console.log("Signup error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// User login
const login = async (req, res) => {

    try {

        // Read login information from the request body
        const { username, email, password } = req.body;

        // Check required information
        if ((!username && !email) || !password) {
            return res.status(400).json({
                message: "Username or email and password are required"
            });
        }

        // Validate input types
        if (typeof password !== 'string' ||
            (username && typeof username !== 'string') ||
            (email && typeof email !== 'string') ||
            (username && email)) {

            return res.status(400).json({
                message: "Invalid login information"
            });
        }

        // Find the user by username or email
        let user;

        if (username) {
            user = await User.findOne({ username: username });
        } else {
            user = await User.findOne({ email: email });
        }

        // Check whether the user exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        // Compare entered password with stored bcrypt hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid username/email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return successful login response
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        console.log("Login error:", error.message);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Export the signup function
module.exports = { signup, login };