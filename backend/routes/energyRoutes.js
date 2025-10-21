const express = require('express');
const router = express.Router();
const { createEnergyReading, getEnergySummaries, getHomeEnergySummary } = require('../controllers/energyController');
const { validateEnergyReadingMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validateEnergyReadingMiddleware, createEnergyReading);
router.get('/summary', auth, getEnergySummaries);
router.get('/summary/:homeId', auth, getHomeEnergySummary);

module.exports = router;