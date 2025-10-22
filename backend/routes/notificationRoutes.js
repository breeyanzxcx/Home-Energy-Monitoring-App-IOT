const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateBulkAcknowledgeMiddleware, validateBulkDeleteMiddleware } = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getNotifications);
router.patch('/:id/acknowledge', auth, notificationController.markAsAcknowledged);
router.patch('/acknowledge', auth, validateBulkAcknowledgeMiddleware, notificationController.bulkAcknowledge);
router.delete('/', auth, validateBulkDeleteMiddleware, notificationController.bulkDelete);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;