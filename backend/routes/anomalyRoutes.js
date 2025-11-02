const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const anomalyController = require('../controllers/anomalyController');

router.get('/', auth, anomalyController.getAnomalies);
router.patch('/:id/resolve', auth, anomalyController.resolveAnomaly); // Add this line
router.patch('/:id/status', auth, anomalyController.updateAnomalyStatus); // Optional: general status update

module.exports = router;