const { saveEnergyReading, computeEnergySummary } = require('../services/energyService');
const Home = require('../models/Home');
const Appliance = require('../models/Appliance');
const Room = require('../models/Room');
const EnergySummary = require('../models/EnergySummary');
const EnergyReading = require('../models/EnergyReading');
const { logger } = require('../utils/logger');

// Helper to validate ownership
const validateOwnership = async (homeId, applianceId, roomId, userId) => {
  const home = await Home.findOne({ _id: homeId, userId });
  if (!home) throw new Error('Home not found or does not belong to you');

  if (applianceId) {
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

// Create single energy reading
const createEnergyReading = async (req, res) => {
  try {
    logger.info(`Creating energy reading for user: ${req.user._id}`);
    const { homeId, applianceId, roomId, energy, power, current, voltage, recorded_at, is_randomized } = req.body;

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
      recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
      is_on: power > 0,
      is_randomized: is_randomized || false
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
      recorded_at: energyReading.recorded_at,
      is_on: energyReading.is_on,
      is_randomized: energyReading.is_randomized
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
    res.status(400).json({ error: 'Invalid input', details: err.message || 'Unknown error' });
  }
};

// Create batch energy readings
const createEnergyReadingsBatch = async (req, res) => {
  try {
    logger.info(`Creating batch energy readings for user: ${req.user._id}`);
    const readings = req.body; // Array of readings
    const savedReadings = [];

    for (const reading of readings) {
      const { homeId, applianceId, roomId, energy, power, current, voltage, recorded_at, is_randomized } = reading;
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
        recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
        is_on: power > 0,
        is_randomized: is_randomized || false
      });

      savedReadings.push({
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
        recorded_at: energyReading.recorded_at,
        is_on: energyReading.is_on,
        is_randomized: energyReading.is_randomized
      });
    }

    logger.info(`Batch energy readings created: ${savedReadings.length}`);
    res.status(201).json(savedReadings);
  } catch (err) {
    logger.error('Create batch energy readings error:', err.stack || err);
    res.status(400).json({ error: 'Invalid input', details: err.message || 'Unknown error' });
  }
};

// Get energy readings with filters
const getEnergyReadings = async (req, res) => {
  try {
    const { homeId, applianceId, roomId, is_randomized, is_on, start_date, end_date } = req.query;
    const query = { userId: req.user._id };

    if (homeId) query.homeId = homeId;
    if (applianceId) query.applianceId = applianceId;
    if (roomId) query.roomId = roomId;
    if (is_randomized !== undefined) query.is_randomized = is_randomized === 'true';
    if (is_on !== undefined) query.is_on = is_on === 'true';
    if (start_date || end_date) {
      query.recorded_at = {};
      if (start_date) query.recorded_at.$gte = new Date(start_date);
      if (end_date) query.recorded_at.$lte = new Date(end_date);
    }

    const readings = await EnergyReading.find(query)
      .populate('homeId', 'name')
      .populate('applianceId', 'name')
      .populate('roomId', 'name')
      .sort({ recorded_at: -1 });
    res.status(200).json(readings);
  } catch (err) {
    logger.error('Get energy readings error:', err.stack || err);
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
    await validateOwnership(homeId, null, null, req.user._id);

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

module.exports = {
  createEnergyReading,
  createEnergyReadingsBatch,
  getEnergyReadings,
  getEnergySummaries,
  getHomeEnergySummary
};