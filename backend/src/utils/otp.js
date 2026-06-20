
const { sendEmail } = require('../services/email');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, type = 'verify', name = 'User') => {
  return sendEmail(email, type, { otp, name });
};

module.exports = { generateOTP, sendOTPEmail };

