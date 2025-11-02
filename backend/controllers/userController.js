const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');
const Notification = require('../models/Notification');
const { JWT_SECRET, REFRESH_TOKEN_SECRET, BASE_URL, UPLOADS_DIR } = require('../config/env');
const { sendEmail } = require('../config/email');
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const { OTP_EXPIRY_MINUTES } = require('../utils/constants');
const { generateOTP } = require('../utils/otp');
const sharp = require('sharp');

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
    logger.info('Generating JWT and refresh token');
    if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
      logger.error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();
    logger.info(`User registered: ${email}`);
    res.status(201).json({ token, refreshToken, user: { id: user._id, email, name } });
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
    logger.info('Generating JWT and refresh token');
    if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
      logger.error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
    logger.info(`User logged in: ${email}`);
    res.status(200).json({ token, refreshToken, user: { id: user._id, email, name: profile.name } });
  } catch (err) {
    logger.error('Login error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    logger.info('Refreshing token');
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.error('No refresh token provided');
      return res.status(400).json({ error: 'Refresh token required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      logger.error('Invalid refresh token');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      logger.error('Invalid refresh token for user:', decoded.userId);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '15m' });
    logger.info(`Token refreshed for user: ${user._id}`);
    res.status(200).json({ token: newToken, refreshToken });
  } catch (err) {
    logger.error('Refresh token error:', err.stack || err);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    logger.info(`Logging out user: ${req.user._id}`);
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    logger.info(`User logged out: ${req.user._id}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Logout error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    logger.info(`Fetching profile for user: ${req.user._id}`);
    const profile = await Profile.findOne({ userId: req.user._id }).select('-__v');
    const user = await User.findById(req.user._id).select('email -_id');
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }
    let profileResponse = { ...profile.toObject(), email: user.email };
    if (profile.profilePicture) {
      profileResponse.profilePicture = `${BASE_URL}/uploads/profile-pictures/${profile.profilePicture}`;
    }
    logger.info(`Profile fetched for user: ${req.user._id}`);
    res.status(200).json(profileResponse);
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
    const user = await User.findById(req.user._id).select('email -_id');
    let profileResponse = { ...profile.toObject(), email: user.email };
    if (profile.profilePicture) {
      profileResponse.profilePicture = `${BASE_URL}/uploads/profile-pictures/${profile.profilePicture}`;
    }
    logger.info(`Profile updated for user: ${req.user._id}`);
    res.status(200).json(profileResponse);
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
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (profile.profilePicture) {
      const filePath = path.join(UPLOADS_DIR, profile.profilePicture);
      try {
        await fs.unlink(filePath);
        logger.info(`Deleted profile picture: ${filePath}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.error(`Failed to delete profile picture: ${filePath}`, err);
        }
      }
    }
    await Profile.findOneAndDelete({ userId: req.user._id });
    logger.info(`Profile deleted for user: ${req.user._id}`);
    res.status(204).send();
  } catch (err) {
    logger.error('Delete profile error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    logger.info(`Uploading profile picture for user: ${req.user._id}`);
    if (!req.file) {
      logger.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const tempPath = req.file.path;
    // Validate and detect format
    let metadata;
    try {
      metadata = await sharp(tempPath).metadata();
    } catch (validationErr) {
      await fs.unlink(tempPath);
      logger.error('Invalid image content:', validationErr);
      return res.status(400).json({ error: 'Invalid image file - must be a valid JPG, PNG, or supported format' });
    }
    // Map detected format to extension
    const formatToExt = {
      jpeg: '.jpg',
      png: '.png',
      gif: '.gif',
      webp: '.webp',
      // Add more if needed
    };
    const ext = formatToExt[metadata.format];
    if (!ext) {
      await fs.unlink(tempPath);
      return res.status(400).json({ error: 'Unsupported image format' });
    }
    // Rename file with correct extension
    const filename = `${req.user._id}-${Date.now()}${ext}`;
    const newPath = path.join(path.dirname(tempPath), filename);
    await fs.rename(tempPath, newPath);
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      await fs.unlink(newPath);
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (profile.profilePicture) {
      const oldFilePath = path.join(UPLOADS_DIR, 'profile-pictures', profile.profilePicture);
      try {
        await fs.unlink(oldFilePath);
        logger.info(`Deleted old profile picture: ${oldFilePath}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.error(`Failed to delete old profile picture: ${oldFilePath}`, err);
        }
      }
    }
    profile.profilePicture = filename;
    await profile.save();
    const profilePictureUrl = `${BASE_URL}/uploads/profile-pictures/${filename}`;
    logger.info(`Profile picture uploaded for user: ${req.user._id}`);
    res.status(200).json({
      ...profile.toObject(),
      profilePicture: profilePictureUrl,
      __v: undefined
    });
  } catch (err) {
    logger.error('Upload profile picture error:', err.stack || err);
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        logger.error(`Failed to delete uploaded file: ${req.file.path}`, unlinkErr);
      }
    }
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    logger.info(`Deleting profile picture for user: ${req.user._id}`);
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      logger.error('Profile not found for user:', req.user._id);
      return res.status(404).json({ error: 'Profile not found' });
    }
    if (!profile.profilePicture) {
      logger.info('No profile picture to delete');
      return res.status(400).json({ error: 'No profile picture to delete' });
    }
    const filePath = path.join(UPLOADS_DIR, profile.profilePicture);
    try {
      await fs.unlink(filePath);
      logger.info(`Deleted profile picture: ${filePath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.error(`Failed to delete profile picture: ${filePath}`, err);
        return res.status(500).json({ error: 'Failed to delete profile picture', details: err.message });
      }
    }
    profile.profilePicture = null;
    await profile.save();
    logger.info(`Profile picture deleted for user: ${req.user._id}`);
    res.status(200).json(profile);
  } catch (err) {
    logger.error('Delete profile picture error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    logger.info(`Requesting password reset for email: ${req.body.email}`);
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.error('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const notification = new Notification({
      userId: user._id,
      homeId: null,
      channels: ['email'],
      message: `Your OTP for password reset is ${otp}`,
      status: 'pending'
    });
    await notification.save();
    const otpRecord = new Otp({
      userId: user._id,
      notificationId: notification._id,
      otp,
      expires_at: expiresAt
    });
    await otpRecord.save();
    try {
      await sendEmail({
        to: email,
        subject: 'Home Energy Monitoring - Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
      });
    } catch (emailErr) {
      await Notification.findByIdAndUpdate(notification._id, { status: 'failed' });
      throw emailErr;
    }
    await Notification.findByIdAndUpdate(notification._id, {
      status: 'sent',
      sent_at: new Date()
    });
    logger.info(`Password reset OTP sent for user: ${user._id}`);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    logger.error('Password reset request error:', err.stack || err);
    res.status(err.message === 'Failed to send email' ? 503 : 500).json({
      error: err.message === 'Failed to send email' ? 'Email service unavailable' : 'Server error',
      details: err.message || 'Failed to send OTP'
    });
  }
};

exports.verifyPasswordReset = async (req, res) => {
  try {
    logger.info(`Verifying password reset for email: ${req.body.email}`);
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.error('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
    const otpRecord = await Otp.findOne({ userId: user._id, otp });
    if (!otpRecord) {
      logger.error('Invalid OTP for user:', user._id);
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > otpRecord.expires_at) {
      logger.error('Expired OTP for user:', user._id);
      await Otp.deleteOne({ _id: otpRecord._id });
      await Notification.findByIdAndUpdate(otpRecord.notificationId, { status: 'failed' });
      return res.status(400).json({ error: 'OTP has expired' });
    }
    if (typeof newPassword !== 'string') {
      logger.error('Invalid new password type:', typeof newPassword);
      return res.status(400).json({ error: 'New password must be a string' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await Notification.findByIdAndUpdate(otpRecord.notificationId, {
      status: 'sent',
      sent_at: new Date()
    });
    await Otp.deleteOne({ _id: otpRecord._id });
    logger.info(`Password reset successful for user: ${user._id}`);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    logger.error('Password reset verification error:', err.stack || err);
    res.status(500).json({ error: 'Server error', details: err.message || 'Unknown error' });
  }
};