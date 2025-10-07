const { OTP_LENGTH } = require('./constants');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString().padStart(OTP_LENGTH, '0');
};

module.exports = {
  generateOTP
};