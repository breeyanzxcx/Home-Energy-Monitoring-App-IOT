const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

let env;
try {
  env = require('../config/env');
} catch (err) {
  logger.error(`Failed to load env.js: ${err.message}`, { stack: err.stack });
  env = { BILLING_RATE: 10 };
}

let { BILLING_RATE } = env;

// Fallback for BILLING_RATE
if (typeof BILLING_RATE === 'undefined' || isNaN(BILLING_RATE)) {
  logger.warn('BILLING_RATE is undefined or invalid in EnergyReading.js, defaulting to 10');
  BILLING_RATE = 10;
}
logger.info(`EnergyReading.js initialized with BILLING_RATE: ${BILLING_RATE}`);

const energyReadingSchema = new mongoose.Schema({
  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applianceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appliance',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  energy: {
    type: Number,
    required: true,
    min: 0
  },
  power: {
    type: Number,
    required: true,
    min: 0
  },
  current: {
    type: Number,
    required: true,
    min: 0
  },
  voltage: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  recorded_at: {
    type: Date,
    default: Date.now
  }
});

// Calculate cost before saving
energyReadingSchema.pre('save', function (next) {
  try {
    logger.info(`Pre-save hook triggered for energy: ${this.energy}, BILLING_RATE: ${BILLING_RATE}`);
    if (typeof this.energy !== 'number' || isNaN(this.energy)) {
      throw new Error(`Invalid energy value: ${this.energy}`);
    }
    this.cost = this.energy * BILLING_RATE;
    logger.info(`Cost calculated: ${this.cost}`);
    next();
  } catch (err) {
    logger.error(`Error in pre-save hook: ${err.message}`, { stack: err.stack });
    next(err);
  }
});

module.exports = mongoose.model('EnergyReading', energyReadingSchema);