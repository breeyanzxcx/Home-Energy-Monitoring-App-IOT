const Notification = require('../models/Notification');
const { logger } = require('../utils/logger');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const getNotifications = async (req, res, next) => {
  try {
    const { status, homeId, limit = 10, offset = 0 } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (status) query.status = status;
    if (homeId) query.homeId = homeId;

    const notifications = await Notification.find(query)
      .populate('anomalyAlertId', 'description severity alert_type')
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    logger.error(`Get notifications error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const markAsAcknowledged = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or not authorized' });
    }

    if (!notification.channels.some(channel => NOTIFICATION_TYPES.includes(channel) && (channel === 'in-app' || channel === 'bill_reminder'))) {
      return res.status(400).json({ error: 'Cannot acknowledge notification with these channels' });
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { status: 'acknowledged', sent_at: new Date() },
      { new: true },
    );

    logger.info(`Notification ${id} acknowledged for user: ${userId}${notification.channels.includes('bill_reminder') ? ' (billing reminder)' : ''}`);
    res.json(updated);
  } catch (err) {
    logger.error(`Mark notification as acknowledged error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const bulkAcknowledge = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user._id;

    const notifications = await Notification.find({ _id: { $in: ids }, userId });
    if (notifications.length === 0) {
      return res.status(404).json({ error: 'No matching notifications found or not authorized' });
    }

    const invalid = notifications.some(n => !n.channels.some(channel => NOTIFICATION_TYPES.includes(channel) && (channel === 'in-app' || channel === 'bill_reminder')));
    if (invalid) {
      return res.status(400).json({ error: 'Some notifications cannot be acknowledged' });
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids }, userId, status: 'pending' },
      { status: 'acknowledged', sent_at: new Date() },
    );

    const billingReminders = notifications.filter(n => n.channels.includes('bill_reminder')).length;
    logger.info(`Bulk acknowledged ${result.modifiedCount} notifications (${billingReminders} billing reminders) for user: ${userId}`);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    logger.error(`Bulk acknowledge notifications error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or not authorized' });
    }

    if (!notification.channels.some(channel => NOTIFICATION_TYPES.includes(channel) && (channel === 'in-app' || channel === 'bill_reminder'))) {
      return res.status(400).json({ error: 'Cannot delete notification with these channels' });
    }

    await Notification.findOneAndDelete({ _id: id, userId });
    logger.info(`Notification deleted: ${id} for user: ${userId}${notification.channels.includes('bill_reminder') ? ' (billing reminder)' : ''}`);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    logger.error(`Delete notification error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user._id;

    const notifications = await Notification.find({ _id: { $in: ids }, userId });
    if (notifications.length === 0) {
      return res.status(404).json({ error: 'No matching notifications found or not authorized' });
    }

    const invalid = notifications.some(n => !n.channels.some(channel => NOTIFICATION_TYPES.includes(channel) && (channel === 'in-app' || channel === 'bill_reminder')));
    if (invalid) {
      return res.status(400).json({ error: 'Some notifications cannot be deleted' });
    }

    const result = await Notification.deleteMany({ _id: { $in: ids }, userId });
    const billingReminders = notifications.filter(n => n.channels.includes('bill_reminder')).length;
    logger.info(`Bulk deleted ${result.deletedCount} notifications (${billingReminders} billing reminders) for user: ${userId}`);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    logger.error(`Bulk delete notifications error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

module.exports = { getNotifications, markAsAcknowledged, bulkAcknowledge, deleteNotification, bulkDelete };