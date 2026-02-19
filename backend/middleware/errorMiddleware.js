// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = { message: message.join(', '), statusCode: 400 };
    }

    // Multer error (File too large)
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = { message: 'Institutional security protocol: Asset exceeds high-bandwidth limit (50MB).', statusCode: 400 };
    }

    // Multer error (Invalid file type or generic)
    if (err.message && err.message.includes('Institutional security protocol')) {
        error = { message: err.message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
    });
};

module.exports = { errorHandler };
