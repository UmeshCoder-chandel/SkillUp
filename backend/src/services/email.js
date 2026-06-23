
// Email service - Hybrid (SendGrid first, Gmail fallback)
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

let isEmailConfigured = false;
let sendGridConfigured = false;
let smtpConfigured = false;
let transporter = null;
let fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;

console.log('=== Email Service Initialization ===');
console.log('From Email:', fromEmail ? fromEmail : 'NOT SET');

// Try SendGrid first
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey && fromEmail) {
  try {
    sgMail.setApiKey(sendgridApiKey);
    sendGridConfigured = true;
    console.log('✅ SendGrid email service configured');
  } catch (err) {
    console.warn('⚠️ SendGrid initialization failed:', err.message);
  }
}

// Set up Gmail SMTP as fallback
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
const smtpSecure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true';

if (emailUser && emailPass) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for port 465, false for 587
      requireTLS: !smtpSecure,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    smtpConfigured = true;
    console.log('✅ Gmail SMTP fallback configured');
  } catch (err) {
    console.warn('⚠️ Gmail SMTP initialization failed:', err.message);
  }
}

isEmailConfigured = sendGridConfigured || smtpConfigured;

if (!isEmailConfigured) {
  console.warn('⚠️ No email service configured');
}

// Email templates
const templates = {
  verify: (otp, name) => ({
    subject: 'Verify your SkillLearn account',
    text: `Welcome to SkillLearn, ${name}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1; text-align: center;">Welcome to SkillLearn!</h1>
      <p style="font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.5;">Your verification code is:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #111827; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h2>
      </div>
      <p style="font-size: 14px; color: #6B7280; line-height: 1.5;">This code will expire in 10 minutes.</p>
    </div>`
  }),
  reset: (otp, name) => ({
    subject: 'Reset your SkillLearn password',
    text: `Hi ${name},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1; text-align: center;">Password Reset</h1>
      <p style="font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.5;">Your password reset code is:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #111827; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h2>
      </div>
      <p style="font-size: 14px; color: #6B7280; line-height: 1.5;">This code will expire in 10 minutes.</p>
    </div>`
  }),
  welcome: (name) => ({
    subject: 'Welcome to SkillLearn!',
    text: `Welcome to SkillLearn, ${name}!\n\nWe're excited to have you here!`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6366F1; text-align: center;">Welcome to SkillLearn!</h1>
      <p style="font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="font-size: 16px; line-height: 1.5;">We're excited to have you on the platform!</p>
    </div>`
  })
};

// Simple retry function
const sendWithRetry = async (fn, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fn();
      return { success: true, result };
    } catch (error) {
      if (i === retries) {
        return { success: false, error };
      }
      console.warn(`⚠️ Email send failed (attempt ${i+1}/${retries+1}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const sendEmail = async (email, templateName, data = {}) => {
  console.log(`\n📧 Sending ${templateName} email to: ${email}`);
  try {
    if (!isEmailConfigured) {
      console.warn('⚠️ Email service not configured, skipping email send');
      return false;
    }

    const template = templates[templateName];
    if (!template) {
      console.error(`❌ Template not found: ${templateName}`);
      return false;
    }

    const mailOptions = {
      to: email,
      from: `SkillLearn <${fromEmail}>`,
      subject: template(data.otp, data.name).subject,
      text: template(data.otp, data.name).text,
      html: template(data.otp, data.name).html
    };

    console.log('📤 Mail options prepared, sending email...');

    // Try SendGrid first
    if (sendGridConfigured) {
      const { success, result, error } = await sendWithRetry(async () => sgMail.send(mailOptions));
      if (success) {
        console.log(`✅ Email sent successfully via SendGrid! Message ID: ${result[0].headers['x-message-id']}`);
        return true;
      }
      console.warn('⚠️ SendGrid failed, falling back to Gmail SMTP:', error.message);
      if (error.response) console.warn('📋 SendGrid error:', JSON.stringify(error.response.body, null, 2));
    }

    // Fall back to Gmail SMTP
    if (smtpConfigured && transporter) {
      const { success, result, error } = await sendWithRetry(async () => transporter.sendMail(mailOptions));
      if (success) {
        console.log(`✅ Email sent successfully via Gmail SMTP! Message ID: ${result.messageId}`);
        return true;
      }
      console.error('❌ Gmail SMTP failed:', error.message);
    }

    return false;
  } catch (err) {
    console.error('❌ Email service error:', err.message);
    return false;
  }
};

module.exports = { sendEmail, isEmailConfigured };
