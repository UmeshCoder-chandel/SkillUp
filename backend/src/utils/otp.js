const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, type = 'verify') => {
  if (!process.env.SMTP_USER) {
    console.log(`[DEV OTP ${type}] ${email}: ${otp}`);
    return true;
  }

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const isReset = type === 'reset';
  await transporter.sendMail({
    from: `"SkillLearn" <${process.env.SMTP_USER}>`,
    to: email,
    subject: isReset ? 'SkillLearn - Password Reset Code' : 'SkillLearn - Email Verification OTP',
    html: isReset
      ? `<h2>Your password reset code is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`
      : `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 10 minutes.</p>`,
  });

  return true;
};

module.exports = { generateOTP, sendOTPEmail };
