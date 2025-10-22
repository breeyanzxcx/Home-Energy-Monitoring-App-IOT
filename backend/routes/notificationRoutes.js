const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateBulkAcknowledgeMiddleware, validateBulkDeleteMiddleware } = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');
const { generateBillingReminders } = require('../services/billingService');

router.post('/test-billing-reminders', async (req, res) => {
  try {
    await generateBillingReminders();
    res.json({ message: 'Billing reminders triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger billing reminders', details: error.message });
  }
});

router.get('/', auth, notificationController.getNotifications);
router.patch('/:id/acknowledge', auth, notificationController.markAsAcknowledged);
router.patch('/acknowledge', auth, validateBulkAcknowledgeMiddleware, notificationController.bulkAcknowledge);
router.delete('/', auth, validateBulkDeleteMiddleware, notificationController.bulkDelete);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;