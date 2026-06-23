
// Email service - production-ready, non-blocking
const nodemailer = require('nodemailer');

let transporter;
let isEmailConfigured = false;

// Support both EMAIL_* and SMTP_* env vars for compatibility
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
const smtpSecure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true';

console.log('=== Email Service Initialization ===');
console.log('Email User:', emailUser ? emailUser : 'NOT SET');
console.log('SMTP Host:', smtpHost);
console.log('SMTP Port:', smtpPort);
console.log('SMTP Secure:', smtpSecure);

if (emailUser && emailPass) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for 587
      requireTLS: !smtpSecure, // for STARTTLS on 587
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000, // 5 seconds to connect (faster fail)
      greetingTimeout: 5000, // 5 seconds for greeting
      socketTimeout: 10000, // 10 seconds total
    });

    // Mark as configured first, don't block server startup
    isEmailConfigured = true;
    console.log('✅ Email service configured (SMTP verification skipped for server startup speed)');
    
    // Optional async verification - doesn't block server
    transporter.verify().then(() => {
      console.log('✅ SMTP Server connection verified');
    }).catch((error) => {
      console.warn('⚠️ SMTP verification failed (but email service still configured):', error.message);
    });
  } catch (err) {
    console.error('❌ Error creating email transporter:', err.message);
    isEmailConfigured = false;
  }
} else {
  console.warn('⚠️ Email credentials not provided (EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS)');
}

// Simple email templates
const templates = {
  verify: (otp, name) => ({
    subject: 'Verify your SkillLearn account',
    text: `Welcome to SkillLearn, ${name}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
  }),
  reset: (otp, name) => ({
    subject: 'Reset your SkillLearn password',
    text: `Hi ${name},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.`,
  }),
  welcome: (name) => ({
    subject: 'Welcome to SkillLearn!',
    text: `Welcome to SkillLearn, ${name}!\n\nWe're excited to have you here.`,
  }),
};

const sendEmail = async (email, templateName, data = {}) => {
  console.log(`\n📧 Sending ${templateName} email to: ${email}`);
  try {
    if (!isEmailConfigured || !transporter) {
      console.warn('⚠️ Email service not configured, skipping email send');
      return false;
    }

    const template = templates[templateName];
    if (!template) {
      console.error(`❌ Template not found: ${templateName}`);
      return false;
    }

    const mailOptions = {
      from: `SkillLearn <${emailUser}>`,
      to: email,
      subject: template(data.otp, data.name).subject,
      text: template(data.otp, data.name).text,
    };

    console.log('📤 Mail options prepared, sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
    console.log('📨 SMTP Response:', result.response);
    return true;
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    console.error('📋 Error details:', JSON.stringify(err, null, 2));
    return false;
  }
};

module.exports = { sendEmail, isEmailConfigured, transporter };

