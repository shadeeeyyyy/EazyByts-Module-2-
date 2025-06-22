const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The MONGO_URI comes from our .env file.
        // Mongoose.connect returns a promise, so we use await.
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options are recommended to avoid deprecation warnings from Mongoose v6 onwards.
            // For Mongoose 6+, these are often the default and can sometimes be omitted,
            // but it's good practice to include them for clarity and future compatibility.
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, log the error and exit the Node.js process.
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit with a non-zero code indicates an error
    }
};

module.exports = connectDB; // Export the function so server.js can use it