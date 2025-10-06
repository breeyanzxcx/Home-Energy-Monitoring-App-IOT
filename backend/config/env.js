const dotenv = require('dotenv');

dotenv.config();

const env = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/home-energy',
  JWT_SECRET: process.env.JWT_SECRET || '390577a62a6463aebf0c4386c357d4e1105cde062243d06fcc675e9e1a8f4353',
  PORT: process.env.PORT || 5000,
  BILLING_RATE: parseFloat(process.env.BILLING_RATE) || 10,
};

module.exports = env;