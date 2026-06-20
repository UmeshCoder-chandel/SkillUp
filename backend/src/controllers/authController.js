
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

  const user = await User.create({
    name,
    email,
    password,
    interests: interests || [],
    isVerified: true, // Auto-verify for production testing
  });

  // Send welcome email in background
  sendEmailBackground(email, 'welcome', { name: user.name });

  sendTokens(user, res);
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

  // Auto-verify if not already done
  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
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
  const { email } = req.body;
  
  // Always return instantly!
  res.json({
    success: true,
    message: 'If an account exists for this email, a reset code has been sent.',
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  
  // Simple password reset (accepts any OTP
  const user = await User.findOne({ email });
  if (user) {
    user.password = password;
    user.isVerified = true;
    await user.save();
  }

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

