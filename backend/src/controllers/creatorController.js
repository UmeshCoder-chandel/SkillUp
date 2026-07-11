const Creator = require('../models/Creator');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const Video = require('../models/Video');
const User = require('../models/User');
const Category = require('../models/Category');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');

exports.getCreators = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [creators, total] = await Promise.all([
    Creator.find({ isActive: true })
      .populate('userId', 'name avatar')
      .sort({ totalVideos: -1 })
      .skip(skip)
      .limit(limit),
    Creator.countDocuments({ isActive: true }),
  ]);

  res.json({
    success: true,
    data: creators,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getCreator = asyncHandler(async (req, res) => {
  const creator = await Creator.findById(req.params.id).populate('userId', 'name avatar email');
  if (!creator) throw ApiError(404, 'Creator not found');

  let isFollowing = false;
  if (req.user) {
    isFollowing = !!(await Follow.findOne({ follower: req.user._id, creator: creator._id }));
  }

  const videos = await Video.find({ creator: creator._id, isPublished: true })
    .populate('category', 'title')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: {
      creator,
      videos,
      followerCount: creator.followers.length,
      isFollowing,
    },
  });
});

exports.followCreator = asyncHandler(async (req, res) => {
  const creator = await Creator.findById(req.params.id);
  if (!creator) throw ApiError(404, 'Creator not found');

  const existing = await Follow.findOne({ follower: req.user._id, creator: creator._id });
  if (existing) {
    await Follow.deleteOne({ _id: existing._id });
    creator.followers = creator.followers.filter((id) => id.toString() !== req.user._id.toString());
    await creator.save();
    return res.json({ success: true, following: false, followerCount: creator.followers.length });
  }

  await Follow.create({ follower: req.user._id, creator: creator._id });
  if (!creator.followers.includes(req.user._id)) {
    creator.followers.push(req.user._id);
    await creator.save();
  }

  await Notification.create({
    user: creator.userId,
    message: `${req.user.name} started following you`,
    type: 'follow',
    relatedId: creator._id,
  });

  res.json({ success: true, following: true, followerCount: creator.followers.length });
});

exports.becomeCreator = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Check if already a creator or already has a pending request
  if (user.role === 'creator') throw ApiError(400, 'You are already a creator');
  if (user.creatorRequest.status === 'pending') throw ApiError(400, 'Your request is already pending');

  const { displayName, bio } = req.body;

  user.creatorRequest = {
    status: 'pending',
    requestedAt: new Date(),
    notes: (bio || displayName) ? `${displayName ? 'Display Name: ' + displayName : ''}${bio ? (displayName ? ', ' : '') + 'Bio: ' + bio : ''}` : ''
  };

  await user.save();
  
  res.status(201).json({ success: true, message: 'Creator request submitted successfully', data: user.toPublicJSON() });
});

exports.uploadVideo = asyncHandler(async (req, res) => {
  const creator = await Creator.findOne({ userId: req.user._id });
  if (!creator) throw ApiError(403, 'Only creators can upload videos');

  const { title, description, category, duration, tags } = req.body;

  if (!req.files?.video?.[0]) {
    throw ApiError(400, 'Video file is required');
  }

  if (!title || !category) {
    throw ApiError(400, 'Title and category are required');
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw ApiError(404, 'Category not found');

  const videoUrl = req.files.video[0].path;
  let thumbnailUrl;

  if (req.files?.thumbnail?.[0]) {
    thumbnailUrl = req.files.thumbnail[0].path;
  } else {
    try {
      // Parse public id correctly from Cloudinary URL
      // Example URL: https://res.cloudinary.com/demo/video/upload/v123456/skilllearn/videos/abc123.mp4
      const urlParts = new URL(videoUrl);
      const pathParts = urlParts.pathname.split('/');
      // Find the part after 'upload' and remove extension
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        const publicIdWithExt = pathParts.slice(uploadIndex + 1).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_auto,w_1280,h_720,c_fill/${publicId}.jpg`;
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Fallback thumbnail if generation fails
      thumbnailUrl = 'https://via.placeholder.com/1280x720?text=No+Thumbnail';
    }
  }

  const video = await Video.create({
    title,
    description: description || '',
    category,
    creator: creator._id,
    duration: duration || 0,
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
    thumbnail: thumbnailUrl,
    videoUrl: videoUrl,
  });

  await Creator.findByIdAndUpdate(creator._id, { $inc: { totalVideos: 1 } });
  await Category.findByIdAndUpdate(category, { $inc: { videoCount: 1 } });

  const followers = creator.followers || [];
  for (const followerId of followers.slice(0, 50)) {
    await Notification.create({
      user: followerId,
      message: `${creator.displayName} uploaded a new video: "${title}"`,
      type: 'new_content',
      relatedId: video._id,
    });
  }

  res.status(201).json({ success: true, data: video });
});
