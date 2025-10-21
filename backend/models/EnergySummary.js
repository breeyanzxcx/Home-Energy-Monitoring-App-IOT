const { Schema, model } = require('mongoose');
const { PERIOD_TYPES } = require('../utils/constants');

const energySummarySchema = new Schema({
  homeId: {
    type: Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applianceId: {
    type: Schema.Types.ObjectId,
    ref: 'Appliance',
    default: null
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  period_start: {
    type: Date,
    required: true
  },
  period_end: {
    type: Date,
    required: true
  },
  period_type: {
    type: String,
    enum: PERIOD_TYPES,
    required: true
  },
  total_energy: {
    type: Number,
    required: true,
    min: [0, 'Total energy must be non-negative']
  },
  avg_power: {
    type: Number,
    required: true,
    min: [0, 'Average power must be non-negative']
  },
  total_cost: {
    type: Number,
    required: true,
    min: [0, 'Total cost must be non-negative']
  },
  reading_count: {
    type: Number,
    required: true,
    min: [0, 'Reading count must be non-negative']
  }
}, { timestamps: true });

module.exports = model('EnergySummary', energySummarySchema);