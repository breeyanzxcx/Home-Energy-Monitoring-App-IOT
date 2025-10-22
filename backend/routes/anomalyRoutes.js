const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const anomalyController = require('../controllers/anomalyController');

router.get('/', auth, anomalyController.getAnomalies);

module.exports = router;