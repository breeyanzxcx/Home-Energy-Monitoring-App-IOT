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

// New function to resolve an anomaly
const resolveAnomaly = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const anomaly = await AnomalyAlert.findOne({ _id: id, userId });

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly alert not found' });
    }

    // Update status to resolved
    anomaly.status = 'resolved';
    await anomaly.save();

    // Populate the updated document for response
    const updatedAnomaly = await AnomalyAlert.findById(id)
      .populate('homeId', 'name')
      .populate('roomId', 'name')
      .populate('applianceId', 'name energy_threshold');

    res.json(updatedAnomaly);
  } catch (err) {
    logger.error(`Resolve anomaly error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

// Optional: General status update function
const updateAnomalyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['active', 'acknowledged', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const anomaly = await AnomalyAlert.findOne({ _id: id, userId });

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly alert not found' });
    }

    anomaly.status = status;
    await anomaly.save();

    // Populate the updated document for response
    const updatedAnomaly = await AnomalyAlert.findById(id)
      .populate('homeId', 'name')
      .populate('roomId', 'name')
      .populate('applianceId', 'name energy_threshold');

    res.json(updatedAnomaly);
  } catch (err) {
    logger.error(`Update anomaly status error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

module.exports = { 
  getAnomalies, 
  resolveAnomaly, 
  updateAnomalyStatus 
};