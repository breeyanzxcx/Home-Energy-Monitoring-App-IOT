const { ESP32_API_KEY } = require('../config/env');
const { logger } = require('../utils/logger');

const verifyDevice = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
      logger.warn('Device auth failed: No API key provided');
      return res.status(401).json({ error: 'Authentication required: No API key' });
    }

    if (apiKey !== ESP32_API_KEY) {
      logger.warn('Device auth failed: Invalid API key');
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Key is valid, proceed
    next();
  } catch (err) {
    logger.error('Device authentication error:', err);
    res.status(401).json({ error: 'Invalid request' });
  }
};

module.exports = verifyDevice;

