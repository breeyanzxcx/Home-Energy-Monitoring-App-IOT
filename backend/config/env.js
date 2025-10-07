const dotenv = require('dotenv');

dotenv.config();

const env = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/home-energy',
  JWT_SECRET: process.env.JWT_SECRET || '390577a62a6463aebf0c4386c357d4e1105cde062243d06fcc675e9e1a8f4353',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
  PORT: process.env.PORT || 5000,
  BILLING_RATE: parseFloat(process.env.BILLING_RATE) || 10,
  UPLOADS_DIR: process.env.UPLOADS_DIR || './uploads/profile-pictures',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  EMAIL_USER: process.env.EMAIL_USER || 'acephilipgclass18@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || 'hibivrgiLLnwtVsq'
};

module.exports = env;