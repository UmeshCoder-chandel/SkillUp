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

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, interests } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError(400, 'Email already registered');

  const user = await User.create({
    name,
    email,
    password,
    interests: interests || [],
    isVerified: true, // Auto-verify all users by default
  });

  sendTokens(user, res);
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw ApiError(404, 'User not found');
  if (user.isVerified) throw ApiError(400, 'Email already verified');
  if (user.otp !== otp) throw ApiError(400, 'Invalid OTP');
  if (user.otpExpires < new Date()) throw ApiError(400, 'OTP expired');

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Send welcome email
  try {
    await sendEmail(email, 'welcome', { name: user.name });
  } catch (emailErr) {
    console.error('Welcome email failed:', emailErr.message);
  }

  sendTokens(user, res);
});

exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw ApiError(404, 'User not found');
  if (user.isVerified) throw ApiError(400, 'Email already verified');

  user.otp = generateOTP();
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendOTPEmail(email, user.otp, 'verify', user.name);
  } catch (emailErr) {
    console.error('OTP email failed:', emailErr.message);
  }

  res.json({ success: true, message: 'OTP sent successfully' });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError(401, 'Invalid email or password');
  }

  // Ensure user is verified (auto-verify if not already)
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
  req.user.refreshToken = undefined;
  await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublicJSON() });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
    await sendOTPEmail(email, otp, 'reset', user.name);
  } catch (emailErr) {
    console.error('Reset email failed:', emailErr.message);
  }
  }

  res.json({
    success: true,
    message: 'If an account exists for this email, a reset code has been sent.',
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires +password');
  if (!user) throw ApiError(404, 'User not found');
  if (user.otp !== otp) throw ApiError(400, 'Invalid reset code');
  if (!user.otpExpires || user.otpExpires < new Date()) throw ApiError(400, 'Reset code expired');

  user.password = password;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});
