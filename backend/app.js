const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Error handler
app.use(errorHandler);

module.exports = app;