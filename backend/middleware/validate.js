const Joi = require('joi');
const constants = require('../utils/constants');

// Validate MAX_NAME_LENGTH
const MAX_NAME_LENGTH = Number.isInteger(constants.MAX_NAME_LENGTH) && constants.MAX_NAME_LENGTH > 0 
  ? constants.MAX_NAME_LENGTH 
  : 50; // Fallback to 50 if invalid

const NOTIFICATION_TYPES = Array.isArray(constants.NOTIFICATION_TYPES) 
  ? constants.NOTIFICATION_TYPES 
  : ['email', 'push', 'in-app', 'bill_reminder']; // Fallback

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
  validateHomeMiddleware: validateMiddleware(homeSchema)
};