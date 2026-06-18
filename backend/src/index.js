require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

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
app.use(helmet());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.MOBILE_URL, process.env.ADMIN_URL].filter(Boolean)
      : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillLearn API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
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
const RESTART_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const startServer = async () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillLearn API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    
    // Periodic server restart (every 10 minutes)
    setInterval(() => {
      console.log('⏰ Scheduled server restart in 5 seconds...');
      setTimeout(() => {
        console.log('🔄 Restarting server...');
        process.exit(0); // Nodemon or PM2 will restart it
      }, 5000);
    }, RESTART_INTERVAL_MS);
    
    console.log(`⏱️  Server will auto-restart every 10 minutes`);
  });
};

startServer();
 
module.exports = app;
