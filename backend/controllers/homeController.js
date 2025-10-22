const Home = require('../models/Home');
const Room = require('../models/Room');
const Appliance = require('../models/Appliance');
const { logger } = require('../utils/logger');

exports.createHome = async (req, res) => {
  try {
    logger.info(`Creating home for user: ${req.user._id}`);
    const { name } = req.body;

    const home = new Home({ userId: req.user._id, name });
    await home.save();
    
    //default rooms for the new home
    const defaultRooms = [
      { name: 'Kitchen', energy_threshold: null },
      { name: 'Living Room', energy_threshold: null },
      { name: 'Bedroom', energy_threshold: null },
      { name: 'Bathroom', energy_threshold: null },
      { name: 'Office', energy_threshold: null },
      { name: 'Garage', energy_threshold: null }
    ];
    
    const roomPromises = defaultRooms.map(roomData => 
      new Room({ 
        homeId: home._id, 
        userId: req.user._id, 
        name: roomData.name, 
        energy_threshold: roomData.energy_threshold 
      }).save()
    );
    
    await Promise.all(roomPromises);
    
    logger.info(`Home created: ${name} for user: ${req.user._id} with ${defaultRooms.length} default rooms`);
    res.status(201).json({ id: home._id, userId: home.userId, name: home.name, createdAt: home.createdAt });
  } catch (err) {
    logger.error('Create home error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getHomes = async (req, res) => {
  try {
    logger.info(`Fetching homes for user: ${req.user._id}`);
    const homes = await Home.find({ userId: req.user._id }).select('-__v');
    logger.info(`Fetched ${homes.length} homes for user: ${req.user._id}`);
    res.status(200).json(homes);
  } catch (err) {
    logger.error('Get homes error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getHomeById = async (req, res) => {
  try {
    logger.info(`Fetching home: ${req.params.id} for user: ${req.user._id}`);
    const home = await Home.findOne({ _id: req.params.id, userId: req.user._id }).select('-__v');
    if (!home) {
      logger.error('Home not found:', req.params.id);
      return res.status(404).json({ error: 'Home not found' });
    }
    logger.info(`Home fetched: ${home.name}`);
    res.status(200).json(home);
  } catch (err) {
    logger.error('Get home error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.updateHome = async (req, res) => {
  try {
    logger.info(`Updating home: ${req.params.id} for user: ${req.user._id}`);
    const { name } = req.body;

    if (!name) {
      logger.error('Name is required for home update');
      return res.status(400).json({ error: 'Name is required' });
    }

    const home = await Home.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { name } },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!home) {
      logger.error('Home not found:', req.params.id);
      return res.status(404).json({ error: 'Home not found' });
    }

    logger.info(`Home updated: ${home.name}`);
    res.status(200).json(home);
  } catch (err) {
    logger.error('Update home error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteHome = async (req, res) => {
  try {
    logger.info(`Deleting home: ${req.params.id} for user: ${req.user._id}`);
    const home = await Home.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!home) {
      logger.error('Home not found:', req.params.id);
      return res.status(404).json({ error: 'Home not found' });
    }
    
    // Cascade: Delete child rooms (preps for appliances later)
    await Room.deleteMany({ homeId: req.params.id });
    await Appliance.deleteMany({ homeId: req.params.id });
    
    logger.info(`Home deleted: ${home.name}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete home error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};