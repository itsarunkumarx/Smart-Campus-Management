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
        console.log('⚠️  BACKEND_URL not set in .env. Skipping self-ping.');
        return;
    }

    // Ping every 14 minutes (Render sleeps after 15 mins of inactivity)
    const interval = 14 * 60 * 1000;

    setInterval(async () => {
        try {
            // 1. Self-ping backend
            const protocol = backendUrl.startsWith('https') ? https : http;

            protocol.get(`${backendUrl}/health`, (res) => {
                console.log(`📡 Keep-alive: Self-ping status code: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error(`❌ Keep-alive: Self-ping error: ${err.message}`);
            });

            // 2. Ping MongoDB
            if (mongoose.connection.readyState === 1) {
                // connection.db is available when state is 1 (connected)
                await mongoose.connection.db.admin().ping();
                console.log('📡 Keep-alive: MongoDB pinged successfully');
            } else {
                console.log('⚠️  Keep-alive: MongoDB not connected, skipping ping.');
            }

        } catch (error) {
            console.error(`❌ Keep-alive error: ${error.message}`);
        }
    }, interval);

    console.log(`🚀 Keep-alive mechanism started (Interval: 14 mins). Pinging: ${backendUrl}`);
};

module.exports = keepAlive;
