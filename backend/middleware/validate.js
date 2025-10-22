const Joi = require('joi');
const constants = require('../utils/constants');

const MAX_NAME_LENGTH = Number.isInteger(constants.MAX_NAME_LENGTH) && constants.MAX_NAME_LENGTH > 0 
  ? constants.MAX_NAME_LENGTH 
  : 50;

const NOTIFICATION_TYPES = Array.isArray(constants.NOTIFICATION_TYPES) 
  ? constants.NOTIFICATION_TYPES 
  : ['email', 'push', 'in-app', 'bill_reminder'];

const OTP_LENGTH = Number.isInteger(constants.OTP_LENGTH) && constants.OTP_LENGTH > 0 
  ? constants.OTP_LENGTH 
  : 6;

const VALID_ENERGY_RANGES = constants.VALID_ENERGY_RANGES || {
  energy: { min: 0, max: 100 },
  power: { min: 0, max: 5000 },
  current: { min: 0, max: 50 },
  voltage: { min: 0, max: 300 }
};

const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    }),
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .required()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
      'string.empty': 'Name is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .optional()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`
    }),
  notification_preferences: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    in_app: Joi.boolean().optional()
  })
    .optional()
    .pattern(Joi.string().valid(...NOTIFICATION_TYPES), Joi.boolean())
    .messages({
      'object.pattern.match': `Notification preferences must only include ${NOTIFICATION_TYPES.join(', ')}`
    })
}).min(1).messages({
  'object.min': 'At least one field (name or notification_preferences) is required'
});

const homeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .required()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
      'string.empty': 'Name is required'
    })
});

const passwordResetRequestSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    })
});

const passwordResetVerifySchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
  otp: Joi.string()
    .length(OTP_LENGTH)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.length': `OTP must be ${OTP_LENGTH} digits`,
      'string.pattern.base': 'OTP must be numeric',
      'string.empty': 'OTP is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.empty': 'New password is required'
    })
});

const roomSchema = Joi.object({
  homeId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid homeId format',
      'string.empty': 'homeId is required'
    }),
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .required()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
      'string.empty': 'Name is required'
    }),
  energy_threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Energy threshold must be non-negative'
    })
});

const updateRoomSchema = Joi.object({
  homeId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid homeId format'
    }),
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .optional()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`
    }),
  energy_threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Energy threshold must be non-negative'
    })
}).min(1).messages({
  'object.min': 'At least one field to update is required'
});

const applianceSchema = Joi.object({
  homeId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid homeId format',
      'string.empty': 'homeId is required'
    }),
  roomId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid roomId format'
    }),
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .required()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
      'string.empty': 'Name is required'
    }),
  type: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .optional()
    .messages({
      'string.max': `Type cannot exceed ${MAX_NAME_LENGTH} characters`
    }),
  energy_threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Energy threshold must be non-negative'
    })
});

const updateApplianceSchema = Joi.object({
  homeId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid homeId format'
    }),
  roomId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid roomId format'
    }),
  name: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .optional()
    .messages({
      'string.max': `Name cannot exceed ${MAX_NAME_LENGTH} characters`
    }),
  type: Joi.string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .optional()
    .messages({
      'string.max': `Type cannot exceed ${MAX_NAME_LENGTH} characters`
    }),
  energy_threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Energy threshold must be non-negative'
    })
}).min(1).messages({
  'object.min': 'At least one field to update is required'
});

const energyReadingSchema = Joi.object({
  homeId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid homeId format',
      'string.empty': 'homeId is required'
    }),
  applianceId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid applianceId format',
      'string.empty': 'applianceId is required'
    }),
  roomId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid roomId format'
    }),
  energy: Joi.number()
    .min(VALID_ENERGY_RANGES.energy.min)
    .max(VALID_ENERGY_RANGES.energy.max)
    .required()
    .messages({
      'number.min': `Energy must be at least ${VALID_ENERGY_RANGES.energy.min} kWh`,
      'number.max': `Energy cannot exceed ${VALID_ENERGY_RANGES.energy.max} kWh`,
      'number.base': 'Energy must be a number',
      'any.required': 'Energy is required'
    }),
  power: Joi.number()
    .min(VALID_ENERGY_RANGES.power.min)
    .max(VALID_ENERGY_RANGES.power.max)
    .required()
    .messages({
      'number.min': `Power must be at least ${VALID_ENERGY_RANGES.power.min} W`,
      'number.max': `Power cannot exceed ${VALID_ENERGY_RANGES.power.max} W`,
      'number.base': 'Power must be a number',
      'any.required': 'Power is required'
    }),
  current: Joi.number()
    .min(VALID_ENERGY_RANGES.current.min)
    .max(VALID_ENERGY_RANGES.current.max)
    .required()
    .messages({
      'number.min': `Current must be at least ${VALID_ENERGY_RANGES.current.min} A`,
      'number.max': `Current cannot exceed ${VALID_ENERGY_RANGES.current.max} A`,
      'number.base': 'Current must be a number',
      'any.required': 'Current is required'
    }),
  voltage: Joi.number()
    .min(VALID_ENERGY_RANGES.voltage.min)
    .max(VALID_ENERGY_RANGES.voltage.max)
    .required()
    .messages({
      'number.min': `Voltage must be at least ${VALID_ENERGY_RANGES.voltage.min} V`,
      'number.max': `Voltage cannot exceed ${VALID_ENERGY_RANGES.voltage.max} V`,
      'number.base': 'Voltage must be a number',
      'any.required': 'Voltage is required'
    }),
  recorded_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'recorded_at must be in ISO format (e.g., 2025-10-07T10:00:00Z)'
    }),
  is_randomized: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_randomized must be a boolean'
    })
});

const energyReadingsBatchSchema = Joi.array().items(energyReadingSchema).min(1).messages({
  'array.min': 'At least one energy reading is required'
});

const bulkAcknowledgeSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
    .messages({
      'array.min': 'At least one ID is required',
      'string.pattern.base': 'Invalid ID format'
    })
});

const bulkDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
    .messages({
      'array.min': 'At least one ID is required',
      'string.pattern.base': 'Invalid ID format'
    })
});

const validateMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

const validateRegisterMiddleware = validateMiddleware(registerSchema);
const validateLoginMiddleware = validateMiddleware(loginSchema);
const validateUpdateProfileMiddleware = validateMiddleware(updateProfileSchema);
const validateHomeMiddleware = validateMiddleware(homeSchema);
const validatePasswordResetRequestMiddleware = validateMiddleware(passwordResetRequestSchema);
const validatePasswordResetVerifyMiddleware = validateMiddleware(passwordResetVerifySchema);
const validateRoomMiddleware = validateMiddleware(roomSchema);
const validateUpdateRoomMiddleware = validateMiddleware(updateRoomSchema);
const validateApplianceMiddleware = validateMiddleware(applianceSchema);
const validateUpdateApplianceMiddleware = validateMiddleware(updateApplianceSchema);
const validateEnergyReadingMiddleware = validateMiddleware(energyReadingSchema);
const validateEnergyReadingsBatchMiddleware = validateMiddleware(energyReadingsBatchSchema);
const validateBulkAcknowledgeMiddleware = validateMiddleware(bulkAcknowledgeSchema);
const validateBulkDeleteMiddleware = validateMiddleware(bulkDeleteSchema);

module.exports = {
  validateRegisterMiddleware,
  validateLoginMiddleware,
  validateUpdateProfileMiddleware,
  validateHomeMiddleware,
  validatePasswordResetRequestMiddleware,
  validatePasswordResetVerifyMiddleware,
  validateRoomMiddleware,
  validateUpdateRoomMiddleware,
  validateApplianceMiddleware,
  validateUpdateApplianceMiddleware,
  validateEnergyReadingMiddleware,
  validateEnergyReadingsBatchMiddleware,
  validateBulkAcknowledgeMiddleware,
  validateBulkDeleteMiddleware
};