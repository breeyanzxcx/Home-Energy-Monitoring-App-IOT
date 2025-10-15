const { Schema, model } = require('mongoose');
const constants = require('../utils/constants');

const roomSchema = new Schema({
  homeId: { type: Schema.Types.ObjectId, ref: 'Home', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: constants.MAX_NAME_LENGTH },
  energy_threshold: { type: Number, min: 0, default: null } // null means use global default later
}, { timestamps: true });

// Compound unique index per constants.UNIQUE_SCOPES.room
roomSchema.index({ name: 1, homeId: 1 }, { unique: true });

module.exports = model('Room', roomSchema);