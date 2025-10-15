const Room = require('../models/Room');
const Home = require('../models/Home'); // For existence/ownership checks
const Appliance = require('../models/Appliance');
const { logger } = require('../utils/logger');
const constants = require('../utils/constants');

// Helper to check if home exists and belongs to user
const validateHomeOwnership = async (homeId, userId) => {
  const home = await Home.findOne({ _id: homeId, userId });
  if (!home) throw new Error('Home not found or does not belong to you');
};

exports.createRoom = async (req, res) => {
  try {
    logger.info(`Creating room for user: ${req.user._id}`);
    const { homeId, name, energy_threshold } = req.body;

    await validateHomeOwnership(homeId, req.user._id);

    const room = new Room({ homeId, userId: req.user._id, name, energy_threshold });
    await room.save();
    logger.info(`Room created: ${name} in home: ${homeId}`);
    res.status(201).json(room);
  } catch (err) {
    logger.error('Create room error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you') {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === 11000) { // Mongo duplicate key
      return res.status(400).json({ error: 'Room name already exists in this home' });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    logger.info(`Fetching rooms for user: ${req.user._id}`);
    let filter = { userId: req.user._id };
    
    if (req.query.homeId) {
      await validateHomeOwnership(req.query.homeId, req.user._id);
      filter.homeId = req.query.homeId;
    }
    
    const rooms = await Room.find(filter).select('-__v');
    logger.info(`Fetched ${rooms.length} rooms for user: ${req.user._id}`);
    res.status(200).json(rooms);
  } catch (err) {
    logger.error('Get rooms error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    logger.info(`Fetching room: ${req.params.id} for user: ${req.user._id}`);
    const room = await Room.findOne({ _id: req.params.id, userId: req.user._id }).select('-__v');
    if (!room) {
      logger.error('Room not found:', req.params.id);
      return res.status(404).json({ error: 'Room not found' });
    }
    logger.info(`Room fetched: ${room.name}`);
    res.status(200).json(room);
  } catch (err) {
    logger.error('Get room error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    logger.info(`Updating room: ${req.params.id} for user: ${req.user._id}`);
    const { name, energy_threshold, homeId } = req.body;

    // If changing homeId, validate new home ownership (optional, but prevent if not provided)
    if (homeId) {
      await validateHomeOwnership(homeId, req.user._id);
    }

    const updateFields = { name, energy_threshold, homeId };
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!room) {
      logger.error('Room not found:', req.params.id);
      return res.status(404).json({ error: 'Room not found' });
    }

    logger.info(`Room updated: ${room.name}`);
    res.status(200).json(room);
  } catch (err) {
    logger.error('Update room error:', err.stack || err);
    if (err.message === 'Home not found or does not belong to you') {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Room name already exists in this home' });
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    logger.info(`Deleting room: ${req.params.id} for user: ${req.user._id}`);
    const room = await Room.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!room) {
      logger.error('Room not found:', req.params.id);
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Cascade: Delete child appliances
    await Appliance.deleteMany({ roomId: req.params.id });
    
    logger.info(`Room deleted: ${room.name}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete room error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};