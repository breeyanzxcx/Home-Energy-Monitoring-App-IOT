const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { logger } = require('../utils/logger');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const createNotification = async ({ userId, homeId, anomalyAlertId, message }) => {
  try {
    if (!NOTIFICATION_TYPES.includes('in-app')) {
      throw new Error('Invalid channel: in-app not supported');
    }
    const notification = new Notification({
      userId,
      homeId,
      anomalyAlertId,
      channels: ['in-app'],
      message,
      status: 'pending',
    });
    await notification.save();
    logger.info(`In-app notification created: ${notification._id} for anomaly: ${anomalyAlertId}`);
    return notification;
  } catch (err) {
    logger.error(`Create notification error: ${err.message}`, { stack: err.stack });
    throw err;
  }
};

const sendNotification = async (notification) => {
  try {
    const { userId, channels, message } = notification;

    if (channels.includes('bill_reminder') && channels.includes('email') && NOTIFICATION_TYPES.includes('email')) {
      const user = await User.findById(userId);
      if (!user) {
        logger.error(`User ${userId} not found for notification ${notification._id}`);
        notification.status = 'failed';
        await notification.save();
        return;
      }

      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Home Energy Monitoring: Billing Reminder',
            text: message,
          });
          logger.info(`Email sent to ${user.email} for notification ${notification._id}`);
          break;
        } catch (emailError) {
          attempts++;
          if (attempts === maxAttempts) {
            logger.error(`Failed to send email to ${user.email} for notification ${notification._id}`, { error: emailError.message, stack: emailError.stack });
            notification.status = 'failed';
            await notification.save();
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    if (channels.includes('bill_reminder') && channels.includes('in-app') && NOTIFICATION_TYPES.includes('in-app')) {
      notification.status = 'sent';
      notification.sent_at = new Date();
      await notification.save();
      logger.info(`In-app notification stored for user ${userId}, notification ${notification._id}`);
    }
  } catch (error) {
    logger.error(`Error sending notification ${notification._id}`, { error: error.message, stack: error.stack });
    notification.status = 'failed';
    await notification.save();
  }
};

module.exports = { createNotification, sendNotification };