const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { JWT_SECRET } = require('../config/env');
const { logger } = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    logger.info('Starting registration process');

    const { email, password, name } = req.body;
    logger.info(`Checking email: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    logger.info('Hashing password');
    if (typeof password !== 'string') {
      logger.error('Invalid password type:', typeof password);
      return res.status(400).json({ error: 'Password must be a string' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info('Creating user');
    const user = new User({ email, password: hashedPassword });
    await user.save();
    logger.info('User saved:', email);

    logger.info('Creating profile');
    const profile = new Profile({ userId: user._id, name });
    await profile.save();
    logger.info('Profile saved for user:', email);

    logger.info('Generating JWT');
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User registered: ${email}`);
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (err) {
    logger.error('Registration error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.login = async (req, res) => {
  try {
    logger.info('Starting login process');

    const { email, password } = req.body;
    logger.info(`Checking email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.error('Invalid credentials for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info('Comparing password');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error('Invalid credentials for password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logger.info('Fetching or creating profile');
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      logger.info('Creating default profile for user:', user._id);
      profile = new Profile({
        userId: user._id,
        name: '',
        notification_preferences: { email: true, push: false, in_app: true }
      });
      await profile.save();
      logger.info('Default profile created for user:', user._id);
    }

    logger.info('Generating JWT');
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User logged in: ${email}`);
    res.status(200).json({ token, user: { id: user._id, email, name: profile.name } });
  } catch (err) {
    logger.error('Login error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    logger.info(`Fetching profile for user: ${req.user._id}`);
    const profile = await Profile.findOne({ userId: req.user._id }).select('-__v');
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }

    logger.info(`Profile fetched for user: ${req.user._id}`);
    res.status(200).json(profile);
  } catch (err) {
    logger.error('Get profile error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    logger.info(`Updating profile for user: ${req.user._id}`);
    const { name, notification_preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (notification_preferences) updateData.notification_preferences = notification_preferences;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }

    logger.info(`Profile updated for user: ${req.user._id}`);
    res.status(200).json(profile);
  } catch (err) {
    logger.error('Update profile error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    logger.info(`Updating user: ${req.user._id}`);
    const { email, password } = req.body;

    if (!email && !password) {
      logger.error('No fields provided for user update');
      return res.status(400).json({ error: 'At least one field (email or password) is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      logger.error('User not found:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        logger.error('Email already exists:', email);
        return res.status(400).json({ error: 'Email already exists' });
      }
      user.email = email;
    }

    if (password) {
      if (typeof password !== 'string') {
        logger.error('Invalid password type:', typeof password);
        return res.status(400).json({ error: 'Password must be a string' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    logger.info(`User updated: ${user.email}`);
    res.status(200).json({ id: user._id, email: user.email });
  } catch (err) {
    logger.error('Update user error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    logger.info(`Deleting user: ${req.user._id}`);
    const user = await User.findById(req.user._id);
    if (!user) {
      logger.error('User not found:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(req.user._id);
    await Profile.findOneAndDelete({ userId: req.user._id });
    logger.info(`User deleted: ${user.email}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete user error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    logger.info(`Deleting profile for user: ${req.user._id}`);
    const profile = await Profile.findOneAndDelete({ userId: req.user._id });
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }

    logger.info(`Profile deleted for user: ${req.user._id}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete profile error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};