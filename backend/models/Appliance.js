const { Schema, model } = require('mongoose');
const constants = require('../utils/constants');

const applianceSchema = new Schema({
  homeId: { type: Schema.Types.ObjectId, ref: 'Home', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', default: null },
  name: { type: String, required: true, maxlength: constants.MAX_NAME_LENGTH },
  type: { type: String, maxlength: constants.MAX_NAME_LENGTH, default: null },
  energy_threshold: { type: Number, min: 0, default: null } // null means use global or room default later
}, { timestamps: true });

// Compound unique index per constants.UNIQUE_SCOPES.appliance
applianceSchema.index({ name: 1, homeId: 1 }, { unique: true });

module.exports = model('Appliance', applianceSchema);