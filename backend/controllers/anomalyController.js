const AnomalyAlert = require('../models/AnomalyAlert');
const { logger } = require('../utils/logger');

const getAnomalies = async (req, res, next) => {
  try {
    const { homeId, applianceId, severity, status, startDate, endDate, alert_type } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (homeId) query.homeId = homeId;
    if (applianceId) query.applianceId = applianceId;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (alert_type) query.alert_type = alert_type;
    if (startDate || endDate) {
      query.detected_at = {};
      if (startDate) query.detected_at.$gte = new Date(startDate);
      if (endDate) query.detected_at.$lte = new Date(endDate);
    }

    const anomalies = await AnomalyAlert.find(query)
      .populate('homeId', 'name')
      .populate('roomId', 'name')
      .populate('applianceId', 'name energy_threshold')
      .populate('energySummaryId', 'total_energy period_type')
      .sort({ detected_at: -1 });

    res.json(anomalies);
  } catch (err) {
    logger.error(`Get anomalies error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

module.exports = { getAnomalies };