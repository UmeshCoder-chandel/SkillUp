const express = require('express');
const videoController = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

const router = express.Router();

router.get('/feed', optionalAuth, videoController.getFeed);
router.get('/category/:categoryId', optionalAuth, videoController.getVideosByCategory);
router.get('/:id/share', optionalAuth, videoController.shareVideo);
router.get('/:id/comments', videoController.getComments);
router.get('/:id', optionalAuth, videoController.getVideo);

router.post('/:id/like', protect, videoController.likeVideo);
router.post(
  '/:id/comments',
  protect,
  [body('text').trim().notEmpty().withMessage('Comment text required')],
  validate,
  videoController.addComment
);

module.exports = router;
