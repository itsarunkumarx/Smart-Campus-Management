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
        console.log('⚠️  [Institutional Guard] BACKEND_URL not set. Eternal Pulse skipped.');
        return;
    }

    // Ping every 14 minutes (Render/Free tiers often sleep after 15 mins)
    const interval = 14 * 60 * 1000;

    const performPing = async (retryCount = 0) => {
        const timestamp = new Date().toLocaleTimeString();

        try {
            // 1. Self-ping backend health endpoint
            const protocol = backendUrl.startsWith('https') ? https : http;

            const req = protocol.get(`${backendUrl}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log(`📡 [Pulse ${timestamp}] System Status: OPERATIONAL (200 OK)`);
                } else {
                    console.warn(`⚠️ [Pulse ${timestamp}] System Warning: Status Code ${res.statusCode}`);
                }
            });

            req.on('error', (err) => {
                console.error(`❌ [Pulse ${timestamp}] Transmission Failure: ${err.message}`);
                if (retryCount < 3) {
                    console.log(`🔄 [Pulse] Retrying transmission (${retryCount + 1}/3)...`);
                    setTimeout(() => performPing(retryCount + 1), 5000);
                }
            });

            // 2. Database Connection Guard
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.db.admin().ping();
                // We don't log every DB ping to keep logs clean, just silent assurance
            } else {
                console.error(`🚨 [Pulse ${timestamp}] Critical: Database Grid Terminated.`);
            }

        } catch (error) {
            console.error(`🚨 [Pulse ${timestamp}] Internal Exception: ${error.message}`);
        }
    };

    // Initial pulse
    performPing();

    // Scheduled pulses
    setInterval(performPing, interval);

    console.log(`🚀 [Eternal Pulse] Initialized. Heartbeat Interval: 14m | Target: ${backendUrl}`);
};

module.exports = keepAlive;
