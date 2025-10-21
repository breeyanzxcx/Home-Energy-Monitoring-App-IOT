const Joi = require('joi');
const constants = require('../utils/constants');

// Validate MAX_NAME_LENGTH
const MAX_NAME_LENGTH = Number.isInteger(constants.MAX_NAME_LENGTH) && constants.MAX_NAME_LENGTH > 0 
  ? constants.MAX_NAME_LENGTH 
  : 50;

// Validate NOTIFICATION_TYPES
const NOTIFICATION_TYPES = Array.isArray(constants.NOTIFICATION_TYPES) 
  ? constants.NOTIFICATION_TYPES 
  : ['email', 'push', 'in-app', 'bill_reminder'];

// Validate OTP_LENGTH
const OTP_LENGTH = Number.isInteger(constants.OTP_LENGTH) && constants.OTP_LENGTH > 0 
  ? constants.OTP_LENGTH 
  : 6;

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
    .min(0)
    .required()
    .messages({
      'number.min': 'Energy must be non-negative',
      'number.base': 'Energy must be a number',
      'any.required': 'Energy is required'
    }),
  power: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Power must be non-negative',
      'number.base': 'Power must be a number',
      'any.required': 'Power is required'
    }),
  current: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Current must be non-negative',
      'number.base': 'Current must be a number',
      'any.required': 'Current is required'
    }),
  voltage: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Voltage must be non-negative',
      'number.base': 'Voltage must be a number',
      'any.required': 'Voltage is required'
    }),
  recorded_at: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'recorded_at must be in ISO format (e.g., 2025-10-07T10:00:00Z)'
    })
});

// Middleware wrappers
const validateMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Define individual middleware functions
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
  validateEnergyReadingMiddleware
};