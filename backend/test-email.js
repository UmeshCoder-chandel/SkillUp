
require('dotenv').config();
const { Resend } = require('resend');
const { sendEmail } = require('./src/services/email');

console.log('Testing email service...');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'NOT SET');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

async function testEmail() {
  try {
    // Test with hardcoded email (replace with your email)
    const testEmail = 'test@example.com'; // REPLACE THIS WITH YOUR REAL EMAIL
    const result = await sendEmail(testEmail, 'otpVerification', { otp: '123456', name: 'Test User' });
    console.log('Email send result:', result);
    console.log('\nCheck your terminal logs above for the [DEV MODE] message with the OTP!');
  } catch (err) {
    console.error('Error testing email:', err);
  }
}

testEmail();
