import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,  // ✅ Reduced from 5000ms (-60%)
      socketTimeoutMS: 10000,           // ✅ Reduced from 30000ms (-67%)
      maxPoolSize: 10,                  // ✅ Connection pooling
      minPoolSize: 5,                   // ✅ Maintain pool
      family: 4,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
export default dbConnect;
