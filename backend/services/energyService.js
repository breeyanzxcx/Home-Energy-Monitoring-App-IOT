const EnergyReading = require('../models/EnergyReading');
const EnergySummary = require('../models/EnergySummary');
const { logger } = require('../utils/logger');
const { PERIOD_TYPES } = require('../utils/constants');

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
  logger.warn('BILLING_RATE is undefined or invalid in energyService.js, defaulting to 10');
  BILLING_RATE = 10;
}
logger.info(`energyService.js initialized with BILLING_RATE: ${BILLING_RATE}`);

const saveEnergyReading = async (readingData) => {
  try {
    logger.info(`Saving energy reading: ${JSON.stringify(readingData, null, 2)}`);
    const energyReading = new EnergyReading(readingData);
    // Fallback: set cost if not set by hook
    if (!energyReading.cost && typeof energyReading.energy === 'number' && !isNaN(energyReading.energy)) {
      energyReading.cost = energyReading.energy * BILLING_RATE;
      logger.info(`Manually set cost in energyService: ${energyReading.cost}`);
    }
    logger.info(`Before save: ${JSON.stringify(energyReading, null, 2)}`);
    await energyReading.save();
    logger.info(`Energy reading saved: ${energyReading._id}`);
    await computeEnergySummary(energyReading);
    return energyReading;
  } catch (err) {
    logger.error(`Save energy reading error: ${err.message}`, { stack: err.stack, readingData });
    throw err;
  }
};

const computeEnergySummary = async (energyReading) => {
  try {
    const { homeId, userId, applianceId, roomId, recorded_at } = energyReading;

    for (const period_type of PERIOD_TYPES) {
      let periodStart, periodEnd;

      switch (period_type) {
        case 'daily':
          periodStart = new Date(recorded_at);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(periodStart);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          periodStart = new Date(recorded_at);
          periodStart.setHours(0, 0, 0, 0);
          periodStart.setDate(periodStart.getDate() - periodStart.getDay());
          periodEnd = new Date(periodStart);
          periodEnd.setDate(periodEnd.getDate() + 6);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          periodStart = new Date(recorded_at.getFullYear(), recorded_at.getMonth(), 1);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(recorded_at.getFullYear(), recorded_at.getMonth() + 1, 0);
          periodEnd.setHours(23, 59, 59, 999);
          break;
        default:
          throw new Error(`Invalid period type: ${period_type}`);
      }

      const readings = await EnergyReading.find({
        homeId,
        userId,
        applianceId,
        roomId,
        recorded_at: { $gte: periodStart, $lte: periodEnd }
      });

      const total_energy = readings.reduce((sum, r) => sum + r.energy, 0);
      const avg_power = readings.length > 0 ? readings.reduce((sum, r) => sum + r.power, 0) / readings.length : 0;
      const total_cost = total_energy * BILLING_RATE;
      const reading_count = readings.length;

      await EnergySummary.findOneAndUpdate(
        {
          homeId,
          userId,
          applianceId,
          roomId,
          period_start: periodStart,
          period_end: periodEnd,
          period_type
        },
        {
          total_energy,
          avg_power,
          total_cost,
          reading_count
        },
        { upsert: true, new: true }
      );

      logger.info(`Energy summary updated for appliance: ${applianceId}, period: ${period_type}`);
    }
  } catch (err) {
    logger.error(`Compute energy summary error: ${err.message}`, { stack: err.stack });
    throw err;
  }
};

module.exports = {
  saveEnergyReading,
  computeEnergySummary
};