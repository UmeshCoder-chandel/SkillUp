
const nodemailer = require('nodemailer');

// Initialize nodemailer transporter
let transporter;
let isEmailConfigured = false;

// Check environment variables for SMTP configuration
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';

if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  isEmailConfigured = true;
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
  welcome: (name = 'User') => ({
    subject: 'Welcome to SkillLearn!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #00C2FF; text-align: center;">Welcome Aboard!</h1>
        <p style="font-size: 16px; color: #333;">Hi ${name},</p>
        <p style="font-size: 16px; color: #333;">
          Thank you for verifying your account! We're excited to have you as part of the SkillLearn community.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Here's what you can do now:</p>
          <ul style="font-size: 15px; color: #333; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Explore trending videos and courses</li>
            <li style="margin-bottom: 8px;">Follow your favorite creators</li>
            <li style="margin-bottom: 8px;">Save videos to watch later</li>
            <li style="margin-bottom: 8px;">Upload your own content (if you're a creator)</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #666;">If you have any questions, feel free to reach out anytime!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">SkillLearn - Learn new skills anytime, anywhere</p>
      </div>
    `,
    text: `Welcome to SkillLearn! Hi ${name}, thank you for verifying your account. We're excited to have you!`,
  }),
};

/**
 * Send an email using nodemailer (or no-op if not configured)
 */
const sendEmail = async (to, templateName, templateData) => {
  try {
    const template = templates[templateName];
    if (!template) return false;

    const { otp, name, subject, message } = templateData || {};
    let emailContent;

    if (templateName === 'welcome') {
      emailContent = template(name || 'User');
    } else if (templateName === 'accountNotification') {
      emailContent = templates.otpVerification('', name || 'User');
    } else {
      emailContent = template(otp || '', name || 'User');
    }

    if (!isEmailConfigured) {
      return true; // Silently succeed if email not configured
    }

    await transporter.sendMail({
      from: `SkillLearn <${emailUser}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return true;
  } catch (error) {
    return true; // Fail silently
  }
};

module.exports = { sendEmail, isEmailConfigured };
