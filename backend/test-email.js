
require('dotenv').config();
const { sendEmail, isEmailConfigured } = require('./src/services/email');

async function testEmail() {
  console.log('=== SendGrid Email Service Test ===');
  console.log('Is Email Configured:', isEmailConfigured);
  
  // Test verification email
  console.log('\nTesting verification email...');
  const verifyResult = await sendEmail('umeshchandel551@gmail.com', 'verify', { 
    otp: '123456', 
    name: 'Test User' 
  });
  console.log('Verification email result:', verifyResult ? '✅ Sent' : '❌ Failed');
  
  // Test password reset email
  console.log('\nTesting password reset email...');
  const resetResult = await sendEmail('umeshchandel551@gmail.com', 'reset', { 
    otp: '654321', 
    name: 'Test User' 
  });
  console.log('Reset email result:', resetResult ? '✅ Sent' : '❌ Failed');
  
  // Test welcome email
  console.log('\nTesting welcome email...');
  const welcomeResult = await sendEmail('umeshchandel551@gmail.com', 'welcome', { 
    name: 'Test User' 
  });
  console.log('Welcome email result:', welcomeResult ? '✅ Sent' : '❌ Failed');
  
  console.log('\n=== Test Complete! ===');
}

testEmail().catch(console.error);
