const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAsRead);
router.put('/:id/read', notificationController.markOneAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
