const { saveEnergyReading } = require('../services/energyService');
const Appliance = require('../models/Appliance');
const { logger } = require('../utils/logger');

const ingestEnergyReading = async (req, res) => {
  try {
    // 1. Get simple data from ESP32
    // --- ADD is_randomized HERE ---
    const { applianceId, energy, power, current, voltage, recorded_at, is_randomized } = req.body;

    // 2. Find the appliance in DB to get its full details
    const appliance = await Appliance.findById(applianceId);

    if (!appliance) {
      logger.warn(`Ingest failed: Appliance not found with ID: ${applianceId}`);
      return res.status(404).json({ error: 'Appliance not found' });
    }

    // 3. Now we have all the IDs we need from the appliance document
    const { userId, homeId, roomId } = appliance;

    // 4. Save the full energy reading using your existing service
    const energyReading = await saveEnergyReading({
      homeId,
      userId,
      applianceId,
      roomId: roomId || null,
      energy,
      power,
      current,
      voltage,
      recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
      is_on: power > 0,
      is_randomized: is_randomized || false // <-- UPDATE THIS LINE
    });

    logger.info(`Ingested energy reading for appliance: ${applianceId}`);
    
    // 5. Send a minimal success response back to the ESP32
    res.status(201).json({ id: energyReading._id, status: 'created' });

  } catch (err) {
    logger.error('Ingest energy reading error:', err.stack || err);
    res.status(400).json({ error: 'Invalid input', details: err.message || 'Unknown error' });
  }
};

module.exports = {
  ingestEnergyReading
};


