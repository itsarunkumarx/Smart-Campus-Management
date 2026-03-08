const https = require('https');
const http = require('http');
const mongoose = require('mongoose');

/**
 * Pings the server's own health endpoint and the MongoDB database
 * to prevent the service from sleeping (e.g., on Render or MongoDB Atlas).
 */
const keepAlive = () => {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        return;
    }

    const isLocal = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

    if (isLocal) {
        return;
    }

    // Ping every 14 minutes (Render/Free tiers often sleep after 15 mins)
    const interval = 14 * 60 * 1000;

    const performPing = async (retryCount = 0) => {
        try {
            // 1. Self-ping backend health endpoint
            const protocol = backendUrl.startsWith('https') ? https : http;

            const req = protocol.get(`${backendUrl}/health`, (res) => {
                // Silenced logs for production cleanliness
            });

            req.on('error', (err) => {
                if (retryCount < 2 && !isLocal) {
                    setTimeout(() => performPing(retryCount + 1), 10000);
                }
            });

            // 2. Database Connection Guard
            if (mongoose.connection && mongoose.connection.readyState === 1) {
                await mongoose.connection.db.admin().ping();
            }
        } catch (error) {
            // Internal Exception handled silently
        }
    };

    // Initial pulse
    performPing();

    // Scheduled pulses
    setInterval(performPing, interval);
};

module.exports = keepAlive;
