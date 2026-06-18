require('dotenv').config();
const { sendEmail } = require('./src/services/email');

async function testEmail() {
  console.log('Testing email sending...');
  
  // Test OTP email
  const otpResult = await sendEmail('umeshchandel551@gmail.com', 'otpVerification', { 
    otp: '123456', 
    name: 'Test User' 
  });
  console.log('OTP email result:', otpResult);
  
  // Test password reset email
  const resetResult = await sendEmail('umeshchandel551@gmail.com', 'passwordReset', { 
    otp: '654321', 
    name: 'Test User' 
  });
  console.log('Reset email result:', resetResult);
  
  // Test welcome email
  const welcomeResult = await sendEmail('umeshchandel551@gmail.com', 'welcome', { 
    name: 'Test User' 
  });
  console.log('Welcome email result:', welcomeResult);
  
  // Test account notification email
  const notificationResult = await sendEmail('umeshchandel551@gmail.com', 'accountNotification', { 
    name: 'Test User',
    subject: 'Account Update',
    message: 'Your account has been updated successfully.'
  });
  console.log('Notification email result:', notificationResult);
  
  console.log('Test complete!');
}

testEmail().catch(console.error);