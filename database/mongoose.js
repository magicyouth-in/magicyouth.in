const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb://magicyouthin:WQW3B7VvgAvYSblR@ac-4xd7xpn-shard-00-00.5otozzf.mongodb.net:27017,ac-4xd7xpn-shard-00-01.5otozzf.mongodb.net:27017,ac-4xd7xpn-shard-00-02.5otozzf.mongodb.net:27017/magicyouth?tls=true&authSource=admin&retryWrites=true&w=majority&appName=MAGICYOUTH';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('[DB] Connected to MongoDB Atlas ✓');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = { connectDB };
