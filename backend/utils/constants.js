module.exports = {
  MAX_NAME_LENGTH: 50,
  UNIQUE_SCOPES: {
    room: ["name", "homeId"],
    appliance: ["name", "homeId"]
  },
  ALERT_TYPES: ["high_energy", "high_cost", "unusual_spike"],
  SEVERITY_LEVELS: ["low", "medium", "high"],
  NOTIFICATION_TYPES: ["email", "push", "in-app", "bill_reminder"],
  PERIOD_TYPES: ["daily", "weekly", "monthly"],
  HIGH_ENERGY_THRESHOLD: 50,
  HIGH_COST_THRESHOLD: 100,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  OTP_LENGTH: 6,
  BILLING_DUE_DAYS: 5,
  OTP_EXPIRY_MINUTES: 10,
  ENERGY_POST_RATE_LIMIT: 100,
  VALID_ENERGY_RANGES: {
    energy: { min: 0, max: 100 }, // kWh
    power: { min: 0, max: 5000 }, // Watts
    current: { min: 0, max: 50 }, // Amps
    voltage: { min: 0, max: 300 } // Volts
  }
};