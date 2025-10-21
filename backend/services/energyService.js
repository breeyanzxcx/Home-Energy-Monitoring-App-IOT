const EnergyReading = require('../models/EnergyReading');
const EnergySummary = require('../models/EnergySummary');
const { logger } = require('../utils/logger');
const { PERIOD_TYPES } = require('../utils/constants');
const { BILLING_RATE } = require('../config/env');

const saveEnergyReading = async (readingData) => {
  try {
    const energyReading = new EnergyReading(readingData);
    await energyReading.save();
    logger.info(`Energy reading saved: ${energyReading._id}`);
    await computeEnergySummary(energyReading);
    return energyReading;
  } catch (err) {
    logger.error('Save energy reading error:', err.stack || err);
    throw err;
  }
};

const computeEnergySummary = async (energyReading) => {
  try {
    const { homeId, userId, applianceId, roomId, recorded_at } = energyReading;

    // Iterate over each period type
    for (const period_type of PERIOD_TYPES) {
      let periodStart, periodEnd;

      // Set period start and end based on period_type
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
          periodStart.setDate(periodStart.getDate() - periodStart.getDay()); // Start of week (Sunday)
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

      // Fetch readings for the period
      const readings = await EnergyReading.find({
        homeId,
        userId,
        applianceId,
        roomId,
        recorded_at: { $gte: periodStart, $lte: periodEnd }
      });

      // Calculate summary metrics
      const total_energy = readings.reduce((sum, r) => sum + r.energy, 0);
      const avg_power = readings.length > 0 ? readings.reduce((sum, r) => sum + r.power, 0) / readings.length : 0;
      const total_cost = total_energy * BILLING_RATE;
      const reading_count = readings.length;

      // Update or create summary
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
    logger.error('Compute energy summary error:', err.stack || err);
    throw err;
  }
};

module.exports = {
  saveEnergyReading,
  computeEnergySummary
};