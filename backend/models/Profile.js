const mongoose = require('mongoose');
const { Schema } = mongoose;
const { MAX_NAME_LENGTH } = require('../utils/constants');

const profileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`]
  },
  notification_preferences: {
    type: Object,
    default: { email: true, push: false, in_app: true }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);