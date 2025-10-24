const express = require('express');
const router = express.Router();
const { ingestEnergyReading } = require('../controllers/ingestController');
const verifyDevice = require('../middleware/verifyDevice');
const rateLimit = require('express-rate-limit');
const { ENERGY_POST_RATE_LIMIT } = require('../utils/constants');

// We use the same rate limiter as your main energy route
const energyPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: ENERGY_POST_RATE_LIMIT, // 100 requests
  message: { error: 'Too many energy posts, please try again after 1 hour' }
});

// Define the new, secure endpoint for the ESP32
// POST /api/ingest/energy
router.post(
  '/energy',
  verifyDevice,      // <-- Our new API key checker
  energyPostLimiter,   // <-- Your existing rate limiter
  ingestEnergyReading  // <-- Our new controller
);

module.exports = router;

