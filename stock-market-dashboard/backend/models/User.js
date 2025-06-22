const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT tokens

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return password field by default in queries
    },
    // New fields for user account data
    watchlist: [
        {
            symbol: { type: String, required: true, uppercase: true },
            name: { type: String } // Optional: Store company name for convenience
        }
    ],
    stocksOwned: [
        {
            symbol: { type: String, required: true, uppercase: true },
            quantity: { type: Number, required: true, min: 0 },
            purchasePrice: { type: Number, required: true, min: 0 },
            purchaseDate: { type: Date, default: Date.now }
        }
    ],
    balance: { // For simulated trading
        type: Number,
        default: 100000 // Initial simulated balance
    }
}, {
    timestamps: true
});

// Hash password before saving (pre-save hook)
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next(); // Move to the next middleware or save operation
        return;
    }
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10); // 10 rounds of hashing
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Compare the entered password with the hashed password stored in the database
    // 'this.password' needs to be accessible, so we make 'password' not selected by default,
    // but explicitly select it in login route.
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token for authentication
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id }, // Payload: user ID
        process.env.JWT_SECRET, // Secret key from .env
        { expiresIn: process.env.JWT_EXPIRE } // Token expiration
    );
};

const User = mongoose.model('User', userSchema);
module.exports = User;