const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, { error: err, path: req.path, method: req.method });
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Server error',
    status
  });
};

module.exports = { errorHandler };