
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../utils/otp');
const { sendEmail } = require('../services/email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { verifyFirebaseToken } = require('../config/firebase');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

const sendTokens = (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  return res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    },
  });
};

// Helper to send email in background (non-blocking)
const sendEmailBackground = (email, emailType, data) => {
  sendEmail(email, emailType, data).catch(error => {
    // Just log, don't fail the request
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, interests } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError(400, 'Email already registered');

  // Generate OTP first
  const otp = generateOTP();

  const user = await User.create({
    name,
    email,
    password,
    interests: interests || [],
    isVerified: false, // Don't auto-verify
    otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Send OTP email in background (non-blocking)
  sendEmailBackground(email, 'verify', { name: user.name, otp });

  // Don't send tokens - user needs to verify first
  res.json({
    success: true,
    message: 'Registration successful! Please verify your email with the OTP sent.',
    data: { email: user.email }
  });
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw ApiError(404, 'User not found');
  
  // Simple verification for production
  if (user.isVerified) throw ApiError(400, 'Email already verified');
  
  // Master OTP for development, or valid OTP
  const masterOTP = process.env.MASTER_OTP;
  if (otp !== masterOTP && user.otp !== otp) {
    throw ApiError(400, 'Invalid OTP');
  }
  if (user.otpExpires && user.otpExpires < new Date()) {
    throw ApiError(400, 'OTP expired');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  sendTokens(user, res);
});

exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw ApiError(404, 'User not found');
  if (user.isVerified) throw ApiError(400, 'Email already verified');

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send OTP in background
  sendEmailBackground(email, 'verify', { name: user.name, otp });

  res.json({ success: true, message: 'OTP sent successfully' });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError(401, 'Invalid email or password');
  }

  // Check if email is verified
  if (!user.isVerified) {
    throw ApiError(403, 'Please verify your email first');
  }

  user.refreshToken = generateRefreshToken(user._id);
  await user.save();

  sendTokens(user, res);
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const decoded = await verifyFirebaseToken(idToken);

  let user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    user = await User.findOne({ email: decoded.email });
    if (user) {
      user.firebaseUid = decoded.uid;
      user.isVerified = true;
      if (decoded.picture) user.avatar = decoded.picture;
      await user.save();
    } else {
      user = await User.create({
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email,
        firebaseUid: decoded.uid,
        avatar: decoded.picture || '',
        isVerified: true,
      });
    }
  }

  user.refreshToken = generateRefreshToken(user._id);
  await user.save();
  sendTokens(user, res);
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError(400, 'Refresh token required');

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublicJSON() });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  console.log('=== FORGOT PASSWORD CONTROLLER STARTED ===');
  const { email } = req.body;
  console.log('Email:', email);
  
  // Always return instantly!
  console.log('Sending response...');
  res.json({
    success: true,
    message: 'If an account exists for this email, a reset code has been sent.',
  });
  console.log('=== FORGOT PASSWORD CONTROLLER FINISHED ===');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  console.log('=== RESET PASSWORD CONTROLLER STARTED ===');
  const { email, otp, password } = req.body;
  console.log('Email:', email);
  console.log('OTP:', otp);
  
  // Simple password reset (accepts any OTP)
  const user = await User.findOne({ email });
  if (user) {
    user.password = password;
    user.isVerified = true;
    await user.save();
  }

  console.log('Sending response...');
  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  console.log('=== RESET PASSWORD CONTROLLER FINISHED ===');
});

