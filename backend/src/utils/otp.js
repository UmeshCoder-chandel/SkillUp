const { sendEmail } = require('../services/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, type = 'verify', name = 'User') => {
  let templateName;
  switch (type) {
    case 'reset':
      templateName = 'passwordReset';
      break;
    case 'verify':
    default:
      templateName = 'otpVerification';
      break;
  }
  return sendEmail(email, templateName, { otp, name });
};

module.exports = { generateOTP, sendOTPEmail };
