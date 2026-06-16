const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, resourceType = 'image') =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `skilllearn/${folder}`,
      resource_type: resourceType,
      allowed_formats: resourceType === 'video' ? ['mp4', 'mov', 'webm', 'avi', 'mkv'] : ['jpg', 'jpeg', 'png', 'webp'],
    },
  });

const uploadAvatar = multer({ storage: createStorage('users'), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadCreatorImage = multer({ storage: createStorage('creators'), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadThumbnail = multer({ storage: createStorage('thumbnails'), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo = multer({
  storage: createStorage('videos', 'video'),
  limits: { fileSize: 500 * 1024 * 1024 },
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadCreatorImage,
  uploadThumbnail,
  uploadVideo,
};
