// Load environment variables from .env file FIRST.
// This ensures process.env.MONGO_URI and process.env.PORT are available.
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const connectDB = require('./config/db'); // We'll create this file next

const app = express(); // Initialize the Express application
const PORT = process.env.PORT || 5000; // Define the port, defaulting to 5000

const userRoutes = require('./routes/userRoutes'); // Import user routes
const stockRoutes = require('./routes/stockRoutes'); // Import stock routes

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 1. Connect to Database
// Call the function to connect to MongoDB.
// We'll define connectDB in a separate file for better organization.
connectDB();

// 2. Middleware
// Middleware are functions that Express executes for every incoming request.

// Enable CORS: This allows your frontend (e.g., on localhost:3000) to make requests
// to your backend (e.g., on localhost:5000) without being blocked by browser security.
app.use(cors());

// Body Parser for JSON data: This middleware parses incoming request bodies with JSON payloads.
// It makes data sent from the frontend (e.g., login credentials) available on req.body.
app.use(express.json());

// 3. Basic Route for Testing
// This is a simple GET request handler for the root URL ("/").
// When you access http://localhost:5000/ in your browser, it will respond with this text.
app.get('/', (req, res) => {
    res.send('Stock Market Dashboard Backend API is running!');
});


// Use User Routes
// All routes in userRoutes will be prefixed with /api/users
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

app.use(notFound);
app.use(errorHandler);

// ... (app.listen) ...

// 4. Start the Server
// Make the Express app listen for incoming requests on the specified PORT.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`);
});