const { Schema, model } = require('mongoose');
const { ALERT_TYPES, SEVERITY_LEVELS } = require('../utils/constants');

const anomalyAlertSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeId: {
    type: Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  applianceId: {
    type: Schema.Types.ObjectId,
    ref: 'Appliance',
    default: null
  },
  energySummaryId: {
    type: Schema.Types.ObjectId,
    ref: 'EnergySummary',
    default: null
  },
  alert_type: {
    type: String,
    enum: ALERT_TYPES,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recommended_action: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: SEVERITY_LEVELS,
    required: true
  },
  detected_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  }
}, { timestamps: true });

anomalyAlertSchema.index({ userId: 1, homeId: 1, detected_at: -1 });

module.exports = model('AnomalyAlert', anomalyAlertSchema);