import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
