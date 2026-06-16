const express = require('express');
const creatorController = require('../controllers/creatorController');
const { protect, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validation');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const router = express.Router();

const videoUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: file.fieldname === 'video' ? 'skilllearn/videos' : 'skilllearn/thumbnails',
      resource_type: file.fieldname === 'video' ? 'video' : 'image',
    }),
  }),
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

router.get('/', creatorController.getCreators);
router.get('/:id', optionalAuth, creatorController.getCreator);
router.post('/:id/follow', protect, creatorController.followCreator);
router.post(
  '/become',
  protect,
  [body('displayName').optional().trim()],
  validate,
  creatorController.becomeCreator
);

// Creator video upload routes
router.post('/videos', protect, videoUpload, creatorController.uploadVideo);

module.exports = router;
