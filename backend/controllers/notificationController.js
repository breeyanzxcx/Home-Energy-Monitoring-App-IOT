const Notification = require('../models/Notification');
const { logger } = require('../utils/logger');

const getNotifications = async (req, res, next) => {
  try {
    const { status, homeId, limit = 10, offset = 0 } = req.query;
    const userId = req.user._id;

    const query = { userId, channels: 'in-app' };
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
      offset: parseInt(offset)
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

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId, channels: 'in-app' },
      { status: 'acknowledged', sent_at: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or not authorized' });
    }

    res.json(notification);
  } catch (err) {
    logger.error(`Mark notification as acknowledged error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const bulkAcknowledge = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { _id: { $in: ids }, userId, channels: 'in-app', status: 'pending' },
      { status: 'acknowledged', sent_at: new Date() }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No matching notifications found or not authorized' });
    }

    logger.info(`Bulk acknowledged ${result.modifiedCount} notifications for user: ${userId}`);
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

    const notification = await Notification.findOneAndDelete(
      { _id: id, userId, channels: 'in-app' }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or not authorized' });
    }

    logger.info(`Notification deleted: ${id} for user: ${userId}`);
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

    const result = await Notification.deleteMany(
      { _id: { $in: ids }, userId, channels: 'in-app' }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No matching notifications found or not authorized' });
    }

    logger.info(`Bulk deleted ${result.deletedCount} notifications for user: ${userId}`);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    logger.error(`Bulk delete notifications error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

module.exports = { getNotifications, markAsAcknowledged, bulkAcknowledge, deleteNotification, bulkDelete };