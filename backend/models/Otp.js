const mongoose = require('mongoose');
const { Schema } = mongoose;
const { OTP_LENGTH } = require('../utils/constants');

const otpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: 'Notification',
    required: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    match: [/^\d{6}$/, 'OTP must be a 6-digit number']
  },
  expires_at: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);