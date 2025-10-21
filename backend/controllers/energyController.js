// backend/controllers/energyController.js
const { saveEnergyReading } = require('../services/energyService');
const Home = require('../models/Home');
const Appliance = require('../models/Appliance');
const Room = require('../models/Room');
const EnergySummary = require('../models/EnergySummary');
const { logger } = require('../utils/logger');

// Helper to validate ownership
const validateOwnership = async (homeId, applianceId, roomId, userId) => {
  const home = await Home.findOne({ _id: homeId, userId });
  if (!home) throw new Error('Home not found or does not belong to you');

  if (applianceId) { // Only validate applianceId if provided (for getHomeEnergySummary)
    const appliance = await Appliance.findOne({ _id: applianceId, userId });
    if (!appliance) throw new Error('Appliance not found or does not belong to you');
    if (appliance.homeId.toString() !== homeId) throw new Error('Appliance does not belong to the specified home');
  }

  if (roomId) {
    const room = await Room.findOne({ _id: roomId, userId });
    if (!room) throw new Error('Room not found or does not belong to you');
    if (room.homeId.toString() !== homeId) throw new Error('Room does not belong to the specified home');
  }
};

// Create energy reading
const createEnergyReading = async (req, res) => {
  try {
    logger.info(`Creating energy reading for user: ${req.user._id}`);
    const { homeId, applianceId, roomId, energy, power, current, voltage, recorded_at } = req.body;

    await validateOwnership(homeId, applianceId, roomId, req.user._id);

    const energyReading = await saveEnergyReading({
      homeId,
      userId: req.user._id,
      applianceId,
      roomId: roomId || null,
      energy,
      power,
      current,
      voltage,
      recorded_at: recorded_at ? new Date(recorded_at) : new Date()
    });

    logger.info(`Energy reading created for appliance: ${applianceId}`);
    res.status(201).json({
      _id: energyReading._id,
      homeId: energyReading.homeId,
      userId: energyReading.userId,
      applianceId: energyReading.applianceId,
      roomId: energyReading.roomId,
      energy: energyReading.energy,
      power: energyReading.power,
      current: energyReading.current,
      voltage: energyReading.voltage,
      cost: energyReading.cost,
      recorded_at: energyReading.recorded_at
    });
  } catch (err) {
    logger.error('Create energy reading error:', err.stack || err);
    if (
      err.message === 'Home not found or does not belong to you' ||
      err.message === 'Appliance not found or does not belong to you' ||
      err.message === 'Appliance does not belong to the specified home' ||
      err.message === 'Room not found or does not belong to you' ||
      err.message === 'Room does not belong to the specified home'
    ) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

// Get energy summaries
const getEnergySummaries = async (req, res) => {
  try {
    const { homeId, applianceId, roomId, period_type } = req.query;
    const query = { userId: req.user._id };

    if (homeId) query.homeId = homeId;
    if (applianceId) query.applianceId = applianceId;
    if (roomId) query.roomId = roomId;
    if (period_type) query.period_type = period_type;

    const summaries = await EnergySummary.find(query)
      .populate('homeId', 'name')
      .populate('applianceId', 'name')
      .populate('roomId', 'name');
    return res.status(200).json(summaries);
  } catch (err) {
    logger.error('Get energy summaries error:', err.stack || err);
    return res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

// Get home energy summary
const getHomeEnergySummary = async (req, res) => {
  try {
    const { homeId } = req.params;
    await validateOwnership(homeId, null, null, req.user._id); // Only check home ownership

    const summaries = await EnergySummary.find({
      userId: req.user._id,
      homeId
    })
      .populate('applianceId', 'name')
      .populate('roomId', 'name');
    return res.status(200).json(summaries);
  } catch (err) {
    logger.error('Get home energy summary error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

// Export functions
module.exports = {
  createEnergyReading: createEnergyReading,
  getEnergySummaries: getEnergySummaries,
  getHomeEnergySummary: getHomeEnergySummary
};