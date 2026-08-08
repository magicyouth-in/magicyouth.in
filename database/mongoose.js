/**
 * database/mongoose.js
 * MongoDB connection using Mongoose.
 * Connects once on startup with retry-optimised settings.
 *
 * NOTE: Admin seeding is done separately via `node scripts/seed-admin.js`.
 */

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS:         10000,
    socketTimeoutMS:          45000,
    maxPoolSize:              10,
    retryWrites:              true,
    w:                        'majority',
  });

  console.log('[DB] Connected to MongoDB Atlas ✓');
}

module.exports = { connectDB };
