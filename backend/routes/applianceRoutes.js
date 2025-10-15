const express = require('express');
const router = express.Router();
const { createAppliance, getAppliances, getApplianceById, updateAppliance, deleteAppliance } = require('../controllers/applianceController');
const { validateApplianceMiddleware, validateUpdateApplianceMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validateApplianceMiddleware, createAppliance);
router.get('/', auth, getAppliances);
router.get('/:id', auth, getApplianceById);
router.put('/:id', auth, validateUpdateApplianceMiddleware, updateAppliance);
router.delete('/:id', auth, deleteAppliance);

module.exports = router;