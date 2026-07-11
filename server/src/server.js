import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env.js';
import { connectDB }   from './config/index.js';
import { createApp }   from './app.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    const app = await createApp();

    app.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${process.env.PORT}/graphql`);
      logger.info(`📁 Upload API  on http://localhost:${process.env.PORT}/api/upload`);
      logger.info(`❤️  Health     on http://localhost:${process.env.PORT}/health`);
    });
  } catch (err) {
    logger.error('Server failed to start', { error: err.message });
    process.exit(1);
  }
};

startServer();