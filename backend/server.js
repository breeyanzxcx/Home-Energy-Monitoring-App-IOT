const { PORT } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { scheduleBillingReminders } = require('./cron');
const { logger } = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();
    scheduleBillingReminders();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Server startup error:', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

startServer();