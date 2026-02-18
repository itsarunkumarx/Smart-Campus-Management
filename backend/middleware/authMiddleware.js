const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from HTTP-only cookie
        token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if user is suspended
            if (req.user.isSuspended) {
                return res.status(403).json({ message: 'Your account has been suspended' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error in auth middleware' });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
