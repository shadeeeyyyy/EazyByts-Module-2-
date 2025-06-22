const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateWatchlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); // Protected route
router.put('/watchlist', protect, updateWatchlist); // New protected route

module.exports = router;