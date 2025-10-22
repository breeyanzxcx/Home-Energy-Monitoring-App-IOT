const { endOfMonth, isLastDayOfMonth, addDays, format } = require('date-fns');
const EnergySummary = require('../models/EnergySummary');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const { sendNotification } = require('./notificationService');
const { logger } = require('../utils/logger');
const { BILLING_DUE_DAYS, NOTIFICATION_TYPES } = require('../utils/constants');

async function generateBillingReminders() {
  try {
    const now = new Date();
    // Temporarily bypass isLastDayOfMonth for testing
    // if (!isLastDayOfMonth(now)) {
    //   logger.info('Not the last day of the month, skipping billing reminders');
    //   return;
    // }
    logger.info('Bypassing last day of month check for testing billing reminders');

    // Use UTC for periodEnd
    const periodEnd = endOfMonth(now);
    const queryStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), periodEnd.getUTCDate(), 0, 0, 0, 0));
    const queryEnd = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), periodEnd.getUTCDate(), 23, 59, 59, 999));
    logger.info(`Querying EnergySummary with period_end range: ${queryStart.toISOString()} to ${queryEnd.toISOString()}`);

    const summaries = await EnergySummary.find({
      period_type: 'monthly',
      period_end: {
        $gte: queryStart,
        $lte: queryEnd,
      },
      total_cost: { $gt: 0 },
    }).populate('homeId userId');

    logger.info(`Found ${summaries.length} summaries for billing reminders`, {
      summaries: summaries.map(s => ({
        _id: s._id.toString(),
        period_end: s.period_end.toISOString(),
        total_cost: s.total_cost,
        homeId: s.homeId ? s.homeId._id.toString() : null,
        userId: s.userId ? s.userId._id.toString() : null,
      })),
    });

    for (const summary of summaries) {
      const { homeId, userId, total_energy, total_cost } = summary;
      if (!homeId || !userId) {
        logger.error(`Invalid homeId or userId for summary ${summary._id}`);
        continue;
      }

      const profile = await Profile.findOne({ userId: userId._id });
      if (!profile) {
        logger.error(`No profile found for user ${userId._id}`);
        continue;
      }

      const channels = [];
      if (profile.notification_preferences.email && NOTIFICATION_TYPES.includes('email')) {
        channels.push('email');
      }
      if (profile.notification_preferences.in_app && NOTIFICATION_TYPES.includes('in-app')) {
        channels.push('in-app');
      }
      if (NOTIFICATION_TYPES.includes('bill_reminder')) {
        channels.push('bill_reminder');
      }

      if (channels.length === 0) {
        logger.info(`No notification channels for user ${userId._id}`);
        continue;
      }

      const dueDate = addDays(periodEnd, BILLING_DUE_DAYS);
      const existing = await Notification.findOne({
        userId: userId._id,
        homeId: homeId._id,
        anomalyAlertId: null,
        channels: { $in: ['bill_reminder'] },
        due_date: dueDate,
      });

      if (existing) {
        logger.info(`Billing reminder already exists for home ${homeId._id}, notification ID: ${existing._id}`);
        continue;
      }

      const message = `Billing Reminder for ${homeId.name}: Your energy usage for ${format(periodEnd, 'MMMM yyyy')} was ${total_energy} kWh, costing ${total_cost} PHP. Payment is due by ${format(dueDate, 'MMMM d, yyyy')}.`;

      const notification = await Notification.create({
        userId: userId._id,
        homeId: homeId._id,
        anomalyAlertId: null,
        channels,
        message,
        status: 'pending',
        created_at: new Date(),
        due_date: dueDate,
      });

      await sendNotification(notification);
      logger.info(`Created billing reminder for home ${homeId._id}, notification ID: ${notification._id}`);
    }
  } catch (error) {
    logger.error('Error generating billing reminders', { error: error.message, stack: error.stack });
  }
}

module.exports = { generateBillingReminders };