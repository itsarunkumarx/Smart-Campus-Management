const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 3;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased to 10s
      socketTimeoutMS: 60000, // Increased to 60s
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
    });

    console.log('✅ Institutional database link established');
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount + 1}/${MAX_RETRIES + 1}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      console.log(`📡 Retrying connection in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retryCount + 1);
    }

    console.log('\n--- Institutional Diagnostic Advice ---');
    console.log('1. Check MongoDB Atlas IP Access List: Ensure "0.0.0.0/0" or your current IP is whitelisted.');
    console.log('2. Network Lockdown: Verify your internet connection or if a firewall is blocking port 27017.');
    console.log('3. URI Integrity: Ensure MONGO_URI in .env is correct and contains the correct password.');
    console.log('----------------------------------------\n');

    process.exit(1);
  }
};

module.exports = connectDB;
