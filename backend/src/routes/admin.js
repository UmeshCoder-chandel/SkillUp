const express = require('express');
const multer = require('multer');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const router = express.Router();

const imageUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: file.fieldname === 'icon' ? 'skilllearn/categories' : 'skilllearn/thumbnails',
      resource_type: 'image',
    }),
  }),
}).single('icon');

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

router.post('/login', adminController.adminLogin);

router.use(protect, authorize('admin'));

router.get('/me', adminController.getAdminMe);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/reports', adminController.getReports);

router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/creator-requests', adminController.getCreatorRequests);
router.put('/creator-requests/:id/approve', adminController.approveCreatorRequest);
router.put('/creator-requests/:id/reject', adminController.rejectCreatorRequest);

router.get('/creators', adminController.getCreators);
router.put('/creators/:id', adminController.updateCreator);
router.put('/creators/:id/approve', adminController.approveCreator);
router.put('/creators/:id/reject', adminController.rejectCreator);
router.delete('/creators/:id', adminController.deleteCreator);

router.get('/categories', categoryController.getCategories);
router.post('/categories', imageUpload, adminController.createCategory);
router.put('/categories/:id', imageUpload, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/videos', adminController.getVideos);
router.post('/videos', videoUpload, adminController.createVideo);
router.put('/videos/:id', videoUpload, adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);

module.exports = router;
