
// Email service using SendGrid API (Render-friendly, no SMTP issues!)
const sgMail = require('@sendgrid/mail');

let isEmailConfigured = false;
let fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

console.log('=== Email Service Initialization ===');
console.log('SendGrid API Key:', sendgridApiKey ? '*** Set' : 'NOT SET');
console.log('From Email:', fromEmail ? fromEmail : 'NOT SET');

if (sendgridApiKey && fromEmail) {
  try {
    sgMail.setApiKey(sendgridApiKey);
    isEmailConfigured = true;
    console.log('✅ SendGrid email service configured');
  } catch (err) {
    console.error('❌ Error initializing SendGrid:', err.message);
    isEmailConfigured = false;
  }
} else {
  console.warn('⚠️ SendGrid credentials not provided (SENDGRID_API_KEY and SENDGRID_FROM_EMAIL required)');
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

// Simple retry function for failed email sends
const sendWithRetry = async (mailOptions, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await sgMail.send(mailOptions);
      return { success: true, result };
    } catch (error) {
      if (i === retries) {
        return { success: false, error };
      }
      console.warn(`⚠️ Email send failed (attempt ${i+1}/${retries+1}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
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
    const { success, result, error } = await sendWithRetry(mailOptions);
    if (success) {
      console.log(`✅ Email sent successfully! Message ID: ${result[0].headers['x-message-id']}`);
      return true;
    } else {
      console.error('❌ Email send failed:', error.message);
      if (error.response) {
        console.error('📋 SendGrid error details:', JSON.stringify(error.response.body, null, 2));
      }
      return false;
    }
  } catch (err) {
    console.error('❌ Email service error:', err.message);
    return false;
  }
};

module.exports = { sendEmail, isEmailConfigured };
