const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', uploadAvatar.single('avatar'), userController.updateProfile);
router.get('/dashboard', userController.getDashboard);
router.get('/watch-history', userController.getWatchHistory);
router.post('/watch-history', userController.addWatchHistory);
router.get('/saved', userController.getSavedVideos);
router.post('/save/:videoId', userController.saveVideo);
router.get('/:id', userController.getUserById);

module.exports = router;
