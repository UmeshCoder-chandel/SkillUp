
const nodemailer = require('nodemailer');

// Initialize nodemailer transporter
let transporter;
let isEmailConfigured = false;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  isEmailConfigured = true;
  console.log('[Email Service] Nodemailer configured successfully');
} else {
  console.warn('[Email Service] SMTP credentials not found. Using dev mode (emails logged to console)');
}

// Email templates
const templates = {
  otpVerification: (otp, name = 'User') => ({
    subject: 'Verify your SkillLearn account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #00C2FF; text-align: center;">Welcome to SkillLearn!</h1>
        <p style="font-size: 16px; color: #333;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333;">
          Thank you for signing up! Please use the following 6-digit verification code to activate your account:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f5f5f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; color: #00C2FF;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #666;">If you didn't sign up for SkillLearn, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">SkillLearn - Learn new skills anytime, anywhere</p>
      </div>
    `,
    text: `Welcome to SkillLearn! Hi ${name}, your verification code is ${otp}. This code expires in 10 minutes.`,
  }),
  passwordReset: (otp, name = 'User') => ({
    subject: 'Reset your SkillLearn password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #00C2FF; text-align: center;">Password Reset Request</h1>
        <p style="font-size: 16px; color: #333;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333;">
          We received a request to reset your password. Please use the following 6-digit code to continue:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f5f5f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; color: #00C2FF;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">SkillLearn - Learn new skills anytime, anywhere</p>
      </div>
    `,
    text: `Password Reset Request! Hi ${name}, your reset code is ${otp}. This code expires in 10 minutes.`,
  }),
  accountVerification: (otp, name = 'User') => ({
    subject: 'Verify your SkillLearn account',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #00C2FF; text-align: center;">Verify Your Email</h1>
        <p style="font-size: 16px; color: #333;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333;">
          Please verify your email address by using the following 6-digit verification code:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f5f5f5; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; color: #00C2FF;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">SkillLearn - Learn new skills anytime, anywhere</p>
      </div>
    `,
    text: `Verify Your Email! Hi ${name}, your verification code is ${otp}. This code expires in 10 minutes.`,
  }),
};

/**
 * Send an email using nodemailer (or log to console in dev)
 * @param {string} to - Recipient email address
 * @param {string} templateName - Template name (otpVerification, passwordReset, accountVerification)
 * @param {object} templateData - Data for template (otp, name)
 */
const sendEmail = async (to, templateName, templateData) => {
  try {
    const template = templates[templateName];
    if (!template) {
      console.error('[Email Service] Invalid template name:', templateName);
      return false;
    }

    const { otp, name } = templateData;
    const emailContent = template(otp, name || 'User');

    // Check if nodemailer is configured
    if (!isEmailConfigured) {
      console.log(`
╔══════════════════════════════════════════════════╗
║  [DEV MODE] Email Would Be Sent                   ║
╠══════════════════════════════════════════════════╣
║  To: ${to.padEnd(48)}║
║  Subject: ${emailContent.subject.padEnd(36)}║
║  OTP: ${otp.padEnd(50)}║
╚══════════════════════════════════════════════════╝
      `);
      return true;
    }

    // Send via nodemailer
    console.log(`[Email Service] Sending email to ${to}...`);
    await transporter.sendMail({
      from: `SkillLearn <${process.env.SMTP_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`[Email Service] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    console.log('[Email Service] Falling back to dev mode logging:');
    const { otp, name } = templateData || {};
    const fallbackTemplate = templates[templateName];
    const subject = fallbackTemplate ? fallbackTemplate(otp || '', name || 'User').subject : 'Email';
    console.log(`
╔══════════════════════════════════════════════════╗
║  [FALLBACK] Email Would Have Been Sent           ║
╠══════════════════════════════════════════════════╣
║  To: ${to.padEnd(48)}║
║  Subject: ${subject.padEnd(36)}║
║  OTP: ${(otp || '').padEnd(50)}║
╚══════════════════════════════════════════════════╝
    `);
    return true;
  }
};

module.exports = { sendEmail, isEmailConfigured };
