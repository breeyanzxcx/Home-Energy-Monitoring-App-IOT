module.exports = {
  MAX_NAME_LENGTH: 50,
  UNIQUE_SCOPES: {
    room: ['name', 'homeId'],
    appliance: ['name', 'homeId']
  },
  ALERT_TYPES: ['high_energy', 'high_cost', 'unusual_spike'],
  SEVERITY_LEVELS: ['low', 'medium', 'high'],
  NOTIFICATION_TYPES: ['email', 'push', 'in-app', 'bill_reminder'],
  PERIOD_TYPES: ['daily', 'weekly', 'monthly'],
  BILLING_RATE: 10,
  HIGH_ENERGY_THRESHOLD: 50
};