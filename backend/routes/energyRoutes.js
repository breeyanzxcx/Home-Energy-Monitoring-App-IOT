const express = require('express');
const router = express.Router();
const { createEnergyReading, createEnergyReadingsBatch, getEnergySummaries, getHomeEnergySummary, getEnergyReadings } = require('../controllers/energyController');
const { validateEnergyReadingMiddleware, validateEnergyReadingsBatchMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { ENERGY_POST_RATE_LIMIT } = require('../utils/constants');

// Rate limiter for energy posts (100 per hour)
const energyPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: ENERGY_POST_RATE_LIMIT, // 100 requests
  message: { error: 'Too many energy posts, please try again after 1 hour' }
});

router.post('/', auth, energyPostLimiter, validateEnergyReadingMiddleware, createEnergyReading);
router.post('/batch', auth, energyPostLimiter, validateEnergyReadingsBatchMiddleware, createEnergyReadingsBatch);
router.get('/', auth, getEnergyReadings);
router.get('/summary', auth, getEnergySummaries);
router.get('/summary/:homeId', auth, getHomeEnergySummary);

module.exports = router;