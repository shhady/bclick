import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async () => {
  mongoose.set('strictQuery', true); // Ensure proper query handling

  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection');
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'sapakim', // Explicit database name
    });
  }

  cached.conn = await cached.promise;
  console.log('MongoDB connected');
  return cached.conn;
};
