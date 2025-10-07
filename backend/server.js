const { PORT } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { logger } = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Server startup error:', err);
    process.exit(1);
  }
};

startServer();