const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');
const roomRoutes = require('./routes/roomRoutes');
const applianceRoutes = require('./routes/applianceRoutes');
const energyRoutes = require('./routes/energyRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// --- Import your new route file ---
const ingestRoutes = require('./routes/ingestRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' }
}));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json());

// Serve static files for profile pictures
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, 'uploads/profile-pictures')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/homes', require('./routes/homeRoutes'));
app.use('/api/rooms', roomRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Add your new ingest route here ---
app.use('/api/ingest', ingestRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;