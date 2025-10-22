const Notification = require('../models/Notification');
const { logger } = require('../utils/logger');

const createNotification = async ({ userId, homeId, anomalyAlertId, message }) => {
  try {
    const notification = new Notification({
      userId,
      homeId,
      anomalyAlertId,
      channels: ['in-app'],
      message,
      status: 'pending'
    });
    await notification.save();
    logger.info(`In-app notification created: ${notification._id} for anomaly: ${anomalyAlertId}`);
    return notification;
  } catch (err) {
    logger.error(`Create notification error: ${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = { createNotification };