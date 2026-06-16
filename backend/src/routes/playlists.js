const express = require('express');
const playlistController = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', playlistController.getPlaylists);
router.post('/', [body('name').trim().notEmpty()], validate, playlistController.createPlaylist);
router.get('/:id', playlistController.getPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.post('/:id/videos', [body('videoId').notEmpty()], validate, playlistController.addVideoToPlaylist);
router.delete('/:id/videos/:videoId', playlistController.removeVideoFromPlaylist);

module.exports = router;
