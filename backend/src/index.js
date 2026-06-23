require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/videos');
const categoryRoutes = require('./routes/categories');
const playlistRoutes = require('./routes/playlists');
const searchRoutes = require('./routes/search');
const creatorRoutes = require('./routes/creators');
const notificationRoutes = require('./routes/notifications'); 
const adminRoutes = require('./routes/admin');
 
connectDB();
initFirebase();

const app = express();

// Trust proxy for Render
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "*"], // Allow all for local mobile development
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.MOBILE_URL || 'http://localhost:8081',
  process.env.ADMIN_URL || 'http://localhost:3000',
];

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      : true,
    credentials: true,
  })
);

// HTTP request logging - use production-friendly format in prod
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server Working', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillLearn API is running', timestamp: new Date() });
});

// Test Email Endpoint - only available in development
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test/email', async (req, res) => {
    console.log('\n=== Test Email Endpoint Hit ===');
    const testEmail = req.query.email || 'umeshchandel551@gmail.com';
    
    try {
      const { sendEmail, isEmailConfigured } = require('./services/email');
      
      const results = {
        isEmailConfigured,
        testEmail,
        emailsSent: {},
        timestamp: new Date()
      };
      
      console.log(`Sending test verification email to ${testEmail}`);
      results.emailsSent.verify = await sendEmail(testEmail, 'verify', { otp: '123456', name: 'Test User' });
      console.log(`Sending test reset email to ${testEmail}`);
      results.emailsSent.reset = await sendEmail(testEmail, 'reset', { otp: '654321', name: 'Test User' });
      
      res.json({
        success: true,
        message: 'Test emails sent successfully (check console for details)',
        data: results
      });
    } catch (error) {
      console.error('❌ Test email endpoint failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test emails',
        error: error.message
      });
    }
  });
}

// Auth routes with rate limiting!
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
 
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SkillLearn API running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
