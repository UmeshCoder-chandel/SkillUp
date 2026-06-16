const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/asyncHandler');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError(401, 'Not authorized, no token'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return next(ApiError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(ApiError(401, 'Not authorized, token invalid'));
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    }
  } catch {
    // ignore invalid token
  }
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(ApiError(403, 'Not authorized for this action'));
  }
  next();
};

module.exports = { protect, optionalAuth, authorize };
