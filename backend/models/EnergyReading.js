const { Schema, model } = require('mongoose');
const { BILLING_RATE } = require('../config/env');

const energyReadingSchema = new Schema({
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
    required: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  energy: {
    type: Number,
    required: true,
    min: [0, 'Energy consumption must be non-negative']
  },
  power: {
    type: Number,
    required: true,
    min: [0, 'Power must be non-negative']
  },
  current: {
    type: Number,
    required: true,
    min: [0, 'Current must be non-negative']
  },
  voltage: {
    type: Number,
    required: true,
    min: [0, 'Voltage must be non-negative']
  },
  cost: {
    type: Number,
    required: true,
    min: [0, 'Cost must be non-negative']
  },
  recorded_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to calculate cost
energyReadingSchema.pre('save', function (next) {
  this.cost = this.energy * BILLING_RATE;
  next();
});

module.exports = model('EnergyReading', energyReadingSchema);