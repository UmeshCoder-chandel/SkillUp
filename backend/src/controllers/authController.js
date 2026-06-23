
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
    console.error('Failed to send email:', error);
  });
};

exports.register = asyncHandler(async (req, res) => {
  console.log('=== REGISTER CONTROLLER STARTED ===');
  const { name, email, password, interests } = req.body;
  console.log('Email:', email);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Email already registered');
    throw ApiError(400, 'Email already registered');
  }

  // Generate OTP first
  const otp = generateOTP();
  console.log('Generated OTP:', otp);

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

  console.log('Registration successful, sending response');
  // Don't send tokens - user needs to verify first
  res.json({
    success: true,
    message: 'Registration successful! Please verify your email with the OTP sent.',
    data: { email: user.email }
  });
  console.log('=== REGISTER CONTROLLER FINISHED ===');
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  console.log('=== VERIFY OTP CONTROLLER STARTED ===');
  const { email, otp } = req.body;
  console.log('Email:', email);
  console.log('Received OTP:', otp);

  // Normalize OTP
  const normalizedOtp = String(otp).trim();

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) {
    console.log('User not found');
    throw ApiError(404, 'User not found');
  }
  
  // Simple verification for production
  if (user.isVerified) {
    console.log('Email already verified');
    throw ApiError(400, 'Email already verified');
  }
  
  // Master OTP for development, or valid OTP
  const masterOTP = process.env.MASTER_OTP;
  console.log('Master OTP:', masterOTP ? 'set' : 'not set');
  console.log('User OTP:', user.otp);
  console.log('Normalized OTP:', normalizedOtp);
  
  const isMasterOtpValid = masterOTP && normalizedOtp === masterOTP;
  const isUserOtpValid = user.otp && normalizedOtp === user.otp;
  
  if (!isMasterOtpValid && !isUserOtpValid) {
    console.log('Invalid OTP');
    throw ApiError(400, 'Invalid OTP');
  }
  
  if (user.otpExpires && user.otpExpires < new Date()) {
    console.log('OTP expired');
    throw ApiError(400, 'OTP expired');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  console.log('OTP verified successfully, sending tokens');
  sendTokens(user, res);
  console.log('=== VERIFY OTP CONTROLLER FINISHED ===');
});

exports.resendOTP = asyncHandler(async (req, res) => {
  console.log('=== RESEND OTP CONTROLLER STARTED ===');
  const { email } = req.body;
  console.log('Email:', email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    throw ApiError(404, 'User not found');
  }
  if (user.isVerified) {
    console.log('Email already verified');
    throw ApiError(400, 'Email already verified');
  }

  const otp = generateOTP();
  console.log('Generated new OTP:', otp);
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send OTP in background
  sendEmailBackground(email, 'verify', { name: user.name, otp });

  console.log('OTP resent successfully');
  res.json({ success: true, message: 'OTP sent successfully' });
  console.log('=== RESEND OTP CONTROLLER FINISHED ===');
});

exports.login = asyncHandler(async (req, res) => {
  console.log('=== LOGIN CONTROLLER STARTED ===');
  const { email, password } = req.body;
  console.log('Email:', email);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    console.log('Invalid email or password');
    throw ApiError(401, 'Invalid email or password');
  }

  // Check if email is verified
  if (!user.isVerified) {
    console.log('Email not verified');
    throw ApiError(403, 'Please verify your email first');
  }

  user.refreshToken = generateRefreshToken(user._id);
  await user.save();

  console.log('Login successful, sending tokens');
  sendTokens(user, res);
  console.log('=== LOGIN CONTROLLER FINISHED ===');
});

exports.googleLogin = asyncHandler(async (req, res) => {
  console.log('=== GOOGLE LOGIN CONTROLLER STARTED ===');
  const { idToken } = req.body;
  const decoded = await verifyFirebaseToken(idToken);
  console.log('Decoded Firebase UID:', decoded.uid);
  console.log('Decoded Firebase email:', decoded.email);

  let user = await User.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    user = await User.findOne({ email: decoded.email });
    if (user) {
      console.log('Found existing user by email, linking Google account');
      user.firebaseUid = decoded.uid;
      user.isVerified = true;
      if (decoded.picture) user.avatar = decoded.picture;
      await user.save();
    } else {
      console.log('Creating new user with Google account');
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
  console.log('Google login successful, sending tokens');
  sendTokens(user, res);
  console.log('=== GOOGLE LOGIN CONTROLLER FINISHED ===');
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
  
  const user = await User.findOne({ email });
  if (user) {
    const otp = generateOTP();
    console.log('Generated reset OTP:', otp);
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    sendEmailBackground(email, 'reset', { name: user.name, otp });
  }
  
  console.log('Sending response...');
  res.json({
    success: true,
    message: 'If an account exists for this email, check your inbox and spam folder for the reset code.',
  });
  console.log('=== FORGOT PASSWORD CONTROLLER FINISHED ===');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  console.log('=== RESET PASSWORD CONTROLLER STARTED ===');
  const { email, otp, password } = req.body;
  console.log('Email:', email);
  console.log('Received OTP:', otp);
  
  // Normalize OTP
  const normalizedOtp = String(otp).trim();
  
  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) {
    console.log('User not found');
    throw ApiError(404, 'User not found');
  }
  
  const masterOTP = process.env.MASTER_OTP;
  const isMasterOtpValid = masterOTP && normalizedOtp === masterOTP;
  const isUserOtpValid = user.otp && normalizedOtp === user.otp;
  
  if (!isMasterOtpValid && !isUserOtpValid) {
    console.log('Invalid OTP');
    throw ApiError(400, 'Invalid OTP');
  }
  
  if (user.otpExpires && user.otpExpires < new Date()) {
    console.log('OTP expired');
    throw ApiError(400, 'OTP expired');
  }
  
  user.password = password;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  console.log('Password reset successful');
  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  console.log('=== RESET PASSWORD CONTROLLER FINISHED ===');
});

