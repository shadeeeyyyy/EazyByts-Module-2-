const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (remove 'Bearer' prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from the token payload and attach to request
            // We exclude the password here for security
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };