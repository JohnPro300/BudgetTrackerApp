import dns from 'dns';
import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB using the MONGO_URI environment variable.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  try {
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined. Set MONGODB_URI or MONGO_URI in your environment.');
    }

    // Check if the MongoDB host is reachable
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);
    
  }
};

export default connectDB;
