const cron = require('node-cron');
const { generateBillingReminders } = require('./services/billingService');
const { logger } = require('./utils/logger');

function scheduleBillingReminders() {
  cron.schedule('59 23 28-31 * *', async () => {
    try {
      logger.info('Checking for billing reminder execution');
      await generateBillingReminders();
    } catch (error) {
      logger.error('Error in billing reminder cron job', { error: error.message, stack: error.stack });
    }
  });
}

module.exports = { scheduleBillingReminders };