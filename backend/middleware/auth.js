const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { logger } = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { _id: decoded.userId };
    next();
  } catch (err) {
    logger.error('Authentication error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;