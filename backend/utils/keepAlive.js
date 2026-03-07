const https = require('https');
const http = require('http');
const mongoose = require('mongoose');

/**
 * Pings the server's own health endpoint and the MongoDB database
 * to prevent the service from sleeping (e.g., on Render or MongoDB Atlas).
 */
const keepAlive = () => {
    const backendUrl = process.env.BACKEND_URL;

    const isLocal = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

    if (isLocal) {
        return;
    }

    if (!backendUrl) {
        console.warn('⚠️ [Eternal Pulse] BACKEND_URL is not defined. Skipping keep-alive pulse.');
        return;
    }

    // Ping every 14 minutes (Render/Free tiers often sleep after 15 mins)
    const interval = 14 * 60 * 1000;

    console.log(`🚀 [Eternal Pulse] Initialized. Production Mode`);
    console.log(`💓 Heartbeat Interval: 14m | Target: ${backendUrl}`);

    const performPing = async (retryCount = 0) => {
        const timestamp = new Date().toLocaleTimeString();

        try {
            // 1. Self-ping backend health endpoint
            const protocol = backendUrl.startsWith('https') ? https : http;

            const req = protocol.get(`${backendUrl}/health`, (res) => {
                if (res.statusCode === 200) {
                    // Only log success occasionally or in development to keep prod logs clean
                    if (isLocal || Math.random() < 0.1) {
                        console.log(`📡 [Pulse ${timestamp}] System Status: OPERATIONAL (200 OK)`);
                    }
                } else if (res.statusCode === 404) {
                    console.error(`❌ [Pulse ${timestamp}] Target Not Found (404). Please check if BACKEND_URL (${backendUrl}) is correct.`);
                } else {
                    console.warn(`⚠️ [Pulse ${timestamp}] System Warning: Status Code ${res.statusCode} at ${backendUrl}/health`);
                }
            });

            req.on('error', (err) => {
                // If local and connection refused, it might just be starting up or restarting
                if (isLocal && (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET')) {
                    console.log(`📡 [Pulse ${timestamp}] Local server not ready for ping, skipping...`);
                } else {
                    console.error(`❌ [Pulse ${timestamp}] Transmission Failure: ${err.message}`);
                    if (retryCount < 2) {
                        console.log(`🔄 [Pulse] Retrying transmission (${retryCount + 1}/2)...`);
                        setTimeout(() => performPing(retryCount + 1), 10000);
                    }
                }
            });

            // 2. Database Connection Guard
            if (mongoose.connection && mongoose.connection.readyState === 1) {
                await mongoose.connection.db.admin().ping();
            } else if (mongoose.connection && mongoose.connection.readyState === 0) {
                console.warn(`📡 [Pulse ${timestamp}] Database: DISCONNECTED (Attempting to reconnect...)`);
            } else if (mongoose.connection && mongoose.connection.readyState === 2) {
                console.log(`📡 [Pulse ${timestamp}] Database: CONNECTING...`);
            } else if (mongoose.connection) {
                console.error(`🚨 [Pulse ${timestamp}] Critical: Database Connection Lost (State: ${mongoose.connection.readyState})`);
            }

        } catch (error) {
            console.error(`🚨 [Pulse ${timestamp}] Internal Exception: ${error.message}`);
        }
    };

    // Initial pulse
    performPing();

    // Scheduled pulses
    setInterval(performPing, interval);
};

module.exports = keepAlive;
