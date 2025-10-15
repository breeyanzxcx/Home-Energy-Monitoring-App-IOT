const Appliance = require('../models/Appliance');
const Home = require('../models/Home');
const Room = require('../models/Room');
const { logger } = require('../utils/logger');
const constants = require('../utils/constants');

// Helper to check if home exists and belongs to user
const validateHomeOwnership = async (homeId, userId) => {
  const home = await Home.findOne({ _id: homeId, userId });
  if (!home) throw new Error('Home not found or does not belong to you');
};

// Helper to check if room exists, belongs to user, and matches homeId if provided
const validateRoomOwnership = async (roomId, userId, homeId) => {
  if (!roomId) return; // Optional
  const room = await Room.findOne({ _id: roomId, userId });
  if (!room) throw new Error('Room not found or does not belong to you');
  if (homeId && room.homeId.toString() !== homeId) {
    throw new Error('Room does not belong to the specified home');
  }
};

exports.createAppliance = async (req, res) => {
  try {
    logger.info(`Creating appliance for user: ${req.user._id}`);
    const { homeId, roomId, name, type, energy_threshold } = req.body;

    await validateHomeOwnership(homeId, req.user._id);
    await validateRoomOwnership(roomId, req.user._id, homeId);

    const appliance = new Appliance({ homeId, roomId, userId: req.user._id, name, type, energy_threshold });
    await appliance.save();
    logger.info(`Appliance created: ${name} in home: ${homeId}`);
    res.status(201).json(appliance);
  } catch (err) {
    logger.error('Create appliance error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you' || 
        err.message === 'Room not found or does not belong to you' ||
        err.message === 'Room does not belong to the specified home') {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === 11000) { // Mongo duplicate key
      return res.status(400).json({ error: 'Appliance name already exists in this home' });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getAppliances = async (req, res) => {
  try {
    logger.info(`Fetching appliances for user: ${req.user._id}`);
    let filter = { userId: req.user._id };
    
    if (req.query.homeId) {
      await validateHomeOwnership(req.query.homeId, req.user._id);
      filter.homeId = req.query.homeId;
    }
    if (req.query.roomId) {
      await validateRoomOwnership(req.query.roomId, req.user._id, req.query.homeId || null);
      filter.roomId = req.query.roomId;
    }
    
    const appliances = await Appliance.find(filter).select('-__v');
    logger.info(`Fetched ${appliances.length} appliances for user: ${req.user._id}`);
    res.status(200).json(appliances);
  } catch (err) {
    logger.error('Get appliances error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you' || 
        err.message === 'Room not found or does not belong to you' ||
        err.message === 'Room does not belong to the specified home') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getApplianceById = async (req, res) => {
  try {
    logger.info(`Fetching appliance: ${req.params.id} for user: ${req.user._id}`);
    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.user._id }).select('-__v');
    if (!appliance) {
      logger.error('Appliance not found:', req.params.id);
      return res.status(404).json({ error: 'Appliance not found' });
    }
    logger.info(`Appliance fetched: ${appliance.name}`);
    res.status(200).json(appliance);
  } catch (err) {
    logger.error('Get appliance error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.updateAppliance = async (req, res) => {
  try {
    logger.info(`Updating appliance: ${req.params.id} for user: ${req.user._id}`);
    const { homeId, roomId, name, type, energy_threshold } = req.body;

    if (homeId) {
      await validateHomeOwnership(homeId, req.user._id);
    }
    await validateRoomOwnership(roomId, req.user._id, homeId || null);

    const updateFields = { homeId, roomId, name, type, energy_threshold };
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const appliance = await Appliance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!appliance) {
      logger.error('Appliance not found:', req.params.id);
      return res.status(404).json({ error: 'Appliance not found' });
    }

    logger.info(`Appliance updated: ${appliance.name}`);
    res.status(200).json(appliance);
  } catch (err) {
    logger.error('Update appliance error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you' || 
        err.message === 'Room not found or does not belong to you' ||
        err.message === 'Room does not belong to the specified home') {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Appliance name already exists in this home' });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteAppliance = async (req, res) => {
  try {
    logger.info(`Deleting appliance: ${req.params.id} for user: ${req.user._id}`);
    const appliance = await Appliance.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!appliance) {
      logger.error('Appliance not found:', req.params.id);
      return res.status(404).json({ error: 'Appliance not found' });
    }
    logger.info(`Appliance deleted: ${appliance.name}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete appliance error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};