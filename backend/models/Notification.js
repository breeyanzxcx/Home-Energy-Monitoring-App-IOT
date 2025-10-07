const mongoose = require('mongoose');
const { Schema } = mongoose;
const { NOTIFICATION_TYPES } = require('../utils/constants');

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeId: {
    type: Schema.Types.ObjectId,
    ref: 'Home',
    required: false
  },
  anomalyAlertId: {
    type: Schema.Types.ObjectId,
    ref: 'AnomalyAlert',
    default: null
  },
  channels: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.every((channel) => NOTIFICATION_TYPES.includes(channel)),
      message: `Channels must be one of: ${NOTIFICATION_TYPES.join(', ')}`
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'acknowledged'],
    default: 'pending'
  },
  sent_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);