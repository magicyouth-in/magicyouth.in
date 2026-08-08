/**
 * database/mongoose.js
 * MongoDB connection using Mongoose.
 * Connects once on startup with retry-optimised settings.
 *
 * NOTE: Admin seeding is done separately via `node scripts/seed-admin.js`.
 */

const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb://magicyouthin:WQW3B7VvgAvYSblR@ac-4xd7xpn-shard-00-00.5otozzf.mongodb.net:27017,ac-4xd7xpn-shard-00-01.5otozzf.mongodb.net:27017,ac-4xd7xpn-shard-00-02.5otozzf.mongodb.net:27017/magicyouth?tls=true&authSource=admin&retryWrites=true&w=majority&appName=MAGICYOUTH';

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS:         10000,
    socketTimeoutMS:          45000,
    maxPoolSize:              10,
    retryWrites:              true,
    w:                        'majority',
  });

  isConnected = true;
  console.log('[DB] Connected to MongoDB Atlas ✓');
}

module.exports = { connectDB };
