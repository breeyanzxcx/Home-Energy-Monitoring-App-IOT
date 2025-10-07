const { Schema, model } = require('mongoose');

const homeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 50 }
}, { timestamps: true });

module.exports = model('Home', homeSchema);