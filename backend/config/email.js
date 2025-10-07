const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('./env');
const { logger } = require('../utils/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

const sendEmail = async ({ to, subject, text }) => {
  try {
    const mailOptions = {
      from: `"Home Energy Monitoring" <${EMAIL_USER}>`,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error('Email sending error:', err.stack || err);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };