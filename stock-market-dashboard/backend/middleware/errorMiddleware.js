const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next error-handling middleware
};

const errorHandler = (err, req, res, next) => {
    // If status code is 200, it's a server-side error, so set to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Don't show stack in production
    });
};

module.exports = { notFound, errorHandler };