const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET; // Fallback for backward compatibility
const JWT_EXPIRE = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined!');
  process.exit(1);
}

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });

const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
