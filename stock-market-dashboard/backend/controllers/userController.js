const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken'); // Import JWT for getSignedJwtToken (already there)

// Helper function to send token and user data in response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(); // Get JWT from user model method

    res.status(statusCode).json({
        success: true,
        token,
        user: { // Send back relevant user data
            id: user._id,
            username: user.username,
            email: user.email,
            watchlist: user.watchlist,
            stocksOwned: user.stocksOwned,
            balance: user.balance
        }
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error('User with that email or username already exists');
    }

    const user = await User.create({ username, email, password });
    sendTokenResponse(user, 201, res);
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter an email and password');
    }

    const user = await User.findOne({ email }).select('+password'); // Select password explicitly

    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current user profile (after authentication)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                watchlist: user.watchlist,
                stocksOwned: user.stocksOwned,
                balance: user.balance
            }
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add/Remove stock from user's watchlist
// @route   PUT /api/users/watchlist
// @access  Private
const updateWatchlist = asyncHandler(async (req, res) => {
    const { symbol, action } = req.body; // action: 'add' or 'remove'

    if (!symbol || !action) {
        res.status(400);
        throw new Error('Please provide stock symbol and action (add/remove)');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const existingWatchlistItem = user.watchlist.find(item => item.symbol === symbol.toUpperCase());

    if (action === 'add') {
        if (existingWatchlistItem) {
            res.status(400);
            throw new Error('Stock already in watchlist');
        }
        user.watchlist.push({ symbol: symbol.toUpperCase() }); // Add with uppercase symbol
        await user.save();
        res.status(200).json({
            success: true,
            message: `${symbol} added to watchlist`,
            watchlist: user.watchlist // Return updated watchlist
        });
    } else if (action === 'remove') {
        if (!existingWatchlistItem) {
            res.status(400);
            throw new Error('Stock not found in watchlist');
        }
        user.watchlist = user.watchlist.filter(item => item.symbol !== symbol.toUpperCase());
        await user.save();
        res.status(200).json({
            success: true,
            message: `${symbol} removed from watchlist`,
            watchlist: user.watchlist // Return updated watchlist
        });
    } else {
        res.status(400);
        throw new Error('Invalid action. Must be "add" or "remove".');
    }
});


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateWatchlist
};