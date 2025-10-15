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
    .regex(/^[0-9a-fA-F]{24}$/) // Mongo ObjectId format
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

// Middleware wrappers
const validateMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

module.exports = {
  validateRegisterMiddleware: validateMiddleware(registerSchema),
  validateLoginMiddleware: validateMiddleware(loginSchema),
  validateUpdateProfileMiddleware: validateMiddleware(updateProfileSchema),
  validateHomeMiddleware: validateMiddleware(homeSchema),
  validatePasswordResetRequestMiddleware: validateMiddleware(passwordResetRequestSchema),
  validatePasswordResetVerifyMiddleware: validateMiddleware(passwordResetVerifySchema),
  validateRoomMiddleware: validateMiddleware(roomSchema),
  validateUpdateRoomMiddleware: validateMiddleware(updateRoomSchema),
  validateApplianceMiddleware: validateMiddleware(applianceSchema),
  validateUpdateApplianceMiddleware: validateMiddleware(updateApplianceSchema)
};