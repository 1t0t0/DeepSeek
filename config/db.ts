import mongoose from "mongoose";

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Use global cache to prevent re-establishing connections in hot reloads
let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI as string;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }

  return cached.conn;
}
