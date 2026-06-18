const { Resend } = require('resend');

// Initialize Resend client
let resend;
let isResendConfigured = false;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  isResendConfigured = true;
  console.log('[Email Service] Resend configured successfully');
} else {
  console.warn('[Email Service] Resend API key not found. Using dev mode (emails logged to console)');
}

// Default sender email (replace with your verified domain)
const DEFAULT_SENDER = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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
 * Send an email using Resend (or log to console in dev)
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

    // Check if Resend is configured
    if (!isResendConfigured) {
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

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: `SkillLearn <${DEFAULT_SENDER}>`,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      console.error('[Email Service] Resend error:', error);
      return false;
    }

    console.log(`[Email Service] Email sent successfully to ${to} (ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    return false;
  }
};

module.exports = { sendEmail, isResendConfigured };
