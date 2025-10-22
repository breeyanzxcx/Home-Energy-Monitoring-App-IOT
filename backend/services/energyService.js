const EnergyReading = require('../models/EnergyReading');
const EnergySummary = require('../models/EnergySummary');
const Appliance = require('../models/Appliance');
const AnomalyAlert = require('../models/AnomalyAlert');
const notificationService = require('./notificationService');
const { logger } = require('../utils/logger');
const { PERIOD_TYPES, HIGH_ENERGY_THRESHOLD } = require('../utils/constants');

let env;
try {
  env = require('../config/env');
} catch (err) {
  logger.error(`Failed to load env.js: ${err.message}`, { stack: err.stack });
  env = { BILLING_RATE: 10 };
}

let { BILLING_RATE } = env;

if (typeof BILLING_RATE === 'undefined' || isNaN(BILLING_RATE)) {
  logger.warn('BILLING_RATE is undefined or invalid in energyService.js, defaulting to 10');
  BILLING_RATE = 10;
}
logger.info(`energyService.js initialized with BILLING_RATE: ${BILLING_RATE}`);

const saveEnergyReading = async (readingData) => {
  try {
    logger.info(`Saving energy reading: ${JSON.stringify(readingData, null, 2)}`);
    const energyReading = new EnergyReading(readingData);
    if (!energyReading.cost && typeof energyReading.energy === 'number' && !isNaN(energyReading.energy)) {
      energyReading.cost = energyReading.energy * BILLING_RATE;
      logger.info(`Manually set cost in energyService: ${energyReading.cost}`);
    }
    await energyReading.save();
    logger.info(`Energy reading saved: ${energyReading._id}`);

    // Update last_monitored_at for real data
    if (!energyReading.is_randomized) {
      await Appliance.findByIdAndUpdate(energyReading.applianceId, {
        last_monitored_at: new Date()
      });
      logger.info(`Updated last_monitored_at for appliance: ${energyReading.applianceId}`);
    }

    await computeEnergySummary(energyReading);
    return energyReading;
  } catch (err) {
    logger.error(`Save energy reading error: ${err.message}`, { stack: err.stack, readingData });
    throw err;
  }
};

const computeEnergySummary = async (energyReading) => {
  try {
    const { homeId, userId, applianceId, roomId, recorded_at, power } = energyReading;

    for (const period_type of PERIOD_TYPES) {
      let periodStart, periodEnd;

      // Use UTC for consistent timezone
      switch (period_type) {
        case 'daily':
          periodStart = new Date(Date.UTC(recorded_at.getUTCFullYear(), recorded_at.getUTCMonth(), recorded_at.getUTCDate()));
          periodEnd = new Date(periodStart);
          periodEnd.setUTCHours(23, 59, 59, 999);
          break;
        case 'weekly':
          periodStart = new Date(Date.UTC(recorded_at.getUTCFullYear(), recorded_at.getUTCMonth(), recorded_at.getUTCDate()));
          periodStart.setUTCDate(periodStart.getUTCDate() - periodStart.getUTCDay());
          periodEnd = new Date(periodStart);
          periodEnd.setUTCDate(periodEnd.getUTCDate() + 6);
          periodEnd.setUTCHours(23, 59, 59, 999);
          break;
        case 'monthly':
          periodStart = new Date(Date.UTC(recorded_at.getUTCFullYear(), recorded_at.getUTCMonth(), 1));
          periodEnd = new Date(Date.UTC(recorded_at.getUTCFullYear(), recorded_at.getUTCMonth() + 1, 0));
          periodEnd.setUTCHours(23, 59, 59, 999);
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
      const active_time_percentage = readings.length > 0
        ? (readings.filter(r => r.is_on).length / readings.length) * 100
        : 0;

      const summary = await EnergySummary.findOneAndUpdate(
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
          reading_count,
          active_time_percentage
        },
        { upsert: true, new: true }
      );

      logger.info(`Energy summary updated for appliance: ${applianceId}, period: ${period_type}`);

      // Anomaly detection (only for real data)
      if (!energyReading.is_randomized) {
        const appliance = await Appliance.findById(applianceId);
        const readingCount = await EnergyReading.countDocuments({ applianceId });

        // Skip anomalies for appliances with insufficient data (<7 days)
        if (readingCount < 7) {
          logger.info(`Skipping anomaly detection for appliance ${applianceId}: insufficient data (${readingCount} readings)`);
          continue;
        }

        // High energy anomaly (monthly)
        if (period_type === 'monthly') {
          const threshold = appliance?.energy_threshold || HIGH_ENERGY_THRESHOLD;
          if (total_energy > threshold) {
            // Debounce: Check for recent similar alert
            const recentAlert = await AnomalyAlert.findOne({
              applianceId,
              alert_type: 'high_energy',
              detected_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (!recentAlert) {
              const alert = new AnomalyAlert({
                userId,
                homeId,
                applianceId,
                roomId,
                energySummaryId: summary._id,
                alert_type: 'high_energy',
                description: `Energy usage for ${appliance?.name || 'appliance'} exceeded ${threshold} kWh: ${total_energy} kWh`,
                recommended_action: 'Check for malfunction or reduce usage',
                severity: total_energy > threshold * 1.5 ? 'high' : 'medium',
                detected_at: new Date()
              });
              await alert.save();
              logger.info(`Anomaly alert created for appliance: ${applianceId}, type: high_energy`);

              // Trigger notification
              const message = `Anomaly detected: ${alert.description}. Recommended: ${alert.recommended_action}`;
              await notificationService.createNotification({
                userId,
                homeId,
                anomalyAlertId: alert._id,
                message
              });
              logger.info(`In-app notification triggered for anomaly: ${alert._id}`);
            }
          }
        }

        // Unusual spike anomaly (daily)
        if (period_type === 'daily') {
          const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const pastReadings = await EnergyReading.find({
            applianceId,
            recorded_at: { $gte: past30Days }
          });
          const historicalAvgPower = pastReadings.length > 0
            ? pastReadings.reduce((sum, r) => sum + r.power, 0) / pastReadings.length
            : 0;

          if (power > 2 * historicalAvgPower && historicalAvgPower > 0) {
            // Debounce: Check for recent similar alert
            const recentAlert = await AnomalyAlert.findOne({
              applianceId,
              alert_type: 'unusual_spike',
              detected_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (!recentAlert) {
              const alert = new AnomalyAlert({
                userId,
                homeId,
                applianceId,
                roomId,
                energySummaryId: summary._id,
                alert_type: 'unusual_spike',
                description: `Power spike for ${appliance?.name || 'appliance'}: ${power} W exceeds 2x historical average (${historicalAvgPower} W)`,
                recommended_action: 'Inspect appliance for potential malfunction',
                severity: 'high',
                detected_at: new Date()
              });
              await alert.save();
              logger.info(`Anomaly alert created for appliance: ${applianceId}, type: unusual_spike`);

              // Trigger notification
              const message = `Anomaly detected: ${alert.description}. Recommended: ${alert.recommended_action}`;
              await notificationService.createNotification({
                userId,
                homeId,
                anomalyAlertId: alert._id,
                message
              });
              logger.info(`In-app notification triggered for anomaly: ${alert._id}`);
            }
          }
        }
      }
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