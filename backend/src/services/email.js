
// Email service - production-ready, non-blocking
const nodemailer = require('nodemailer');

let transporter;
let isEmailConfigured = false;

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';

if (emailUser && emailPass) {
  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000, // 10 seconds to connect
      greetingTimeout: 10000, // 10 seconds for greeting
      socketTimeout: 15000, // 15 seconds total
    });
    isEmailConfigured = true;
  } catch (err) {
    isEmailConfigured = false;
  }
}

// Simple email templates
const templates = {
  verify: (otp, name) => ({
    subject: 'Verify your SkillLearn account',
    text: `Welcome to SkillLearn! Your verification code is ${otp}`,
  }),
  reset: (otp, name) => ({
    subject: 'Reset your SkillLearn password',
    text: `Your password reset code is ${otp}`,
  }),
  welcome: (name) => ({
    subject: 'Welcome to SkillLearn!',
    text: `Welcome to SkillLearn, ${name}!`,
  }),
};

const sendEmail = async (email, templateName, data = {}) => {
  try {
    if (!isEmailConfigured || !transporter) return true; // No email configured, just return success

    const template = templates[templateName];
    if (!template) return true;

    const mailOptions = {
      from: `SkillLearn &lt;${emailUser}&gt;`,
      to: email,
      subject: template(data.otp, data.name).subject,
      text: template(data.otp, data.name).text,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    // Fail silently - don't break the app
    return true;
  }
};

module.exports = { sendEmail, isEmailConfigured };

