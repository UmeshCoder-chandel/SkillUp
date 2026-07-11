const User = require('../models/User');
const Creator = require('../models/Creator');
const Category = require('../models/Category');
const Video = require('../models/Video');
const Notification = require('../models/Notification');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCreators, totalVideos, totalCategories, recentUsers, topVideos] =
    await Promise.all([
      User.countDocuments(),
      Creator.countDocuments(),
      Video.countDocuments(),
      Category.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Video.find().sort({ views: -1 }).limit(5).populate('creator', 'displayName'),
    ]);

  const totalViews = await Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalCreators,
        totalVideos,
        totalCategories,
        totalViews: totalViews[0]?.total || 0,
      },
      recentUsers,
      topVideos,
    },
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -refreshToken -otp').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) throw ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError(404, 'User not found');
  res.json({ success: true, message: 'User deleted' });
});

exports.getCreators = asyncHandler(async (req, res) => {
  const creators = await Creator.find().populate('userId', 'name email avatar').sort({ createdAt: -1 });
  res.json({ success: true, data: creators });
});

exports.updateCreator = asyncHandler(async (req, res) => {
  const creator = await Creator.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!creator) throw ApiError(404, 'Creator not found');
  res.json({ success: true, data: creator });
});

exports.deleteCreator = asyncHandler(async (req, res) => {
  await Creator.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Creator deleted' });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.icon = req.file.path;
  const category = await Category.create(data);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.icon = req.file.path;
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!category) throw ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

exports.getVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [videos, total] = await Promise.all([
    Video.find()
      .populate('creator', 'displayName')
      .populate('category', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Video.countDocuments(),
  ]);

  res.json({ success: true, data: videos, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.createVideo = asyncHandler(async (req, res) => {
  const { title, description, category, creator, duration, tags } = req.body;

  if (!req.files?.video?.[0]) {
    throw ApiError(400, 'Video file is required');
  }

  const videoUrl = req.files.video[0].path;
  let thumbnailUrl;

  if (req.files?.thumbnail?.[0]) {
    thumbnailUrl = req.files.thumbnail[0].path;
  } else {
    try {
      const publicId = videoUrl.split('/').pop().split('.')[0];
      thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_auto,w_1280,h_720,c_fill/${publicId}.jpg`;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    }
  }

  const video = await Video.create({
    title,
    description,
    category,
    creator,
    duration: duration || 0,
    tags: tags ? JSON.parse(tags) : [],
    thumbnail: thumbnailUrl,
    videoUrl: videoUrl,
  });

  await Creator.findByIdAndUpdate(creator, { $inc: { totalVideos: 1 } });
  await Category.findByIdAndUpdate(category, { $inc: { videoCount: 1 } });

  const creatorDoc = await Creator.findById(creator);
  if (creatorDoc) {
    const followers = creatorDoc.followers || [];
    for (const followerId of followers.slice(0, 50)) {
      await Notification.create({
        user: followerId,
        message: `New video: "${title}" from ${creatorDoc.displayName}`,
        type: 'new_content',
        relatedId: video._id,
      });
    }
  }

  res.status(201).json({ success: true, data: video });
});

exports.updateVideo = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.files?.thumbnail?.[0]) updates.thumbnail = req.files.thumbnail[0].path;
  if (req.files?.video?.[0]) updates.videoUrl = req.files.video[0].path;

  const oldVideo = await Video.findById(req.params.id);
  if (!oldVideo) throw ApiError(404, 'Video not found');

  const video = await Video.findByIdAndUpdate(req.params.id, updates, { new: true });
  
  res.json({ success: true, data: video });
});

exports.deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) throw ApiError(404, 'Video not found');
  await Creator.findByIdAndUpdate(video.creator, { $inc: { totalVideos: -1 } });
  await Category.findByIdAndUpdate(video.category, { $inc: { videoCount: -1 } });
  res.json({ success: true, message: 'Video deleted' });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [usersByDay, videosByCategory, viewsTrend] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Video.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { title: '$category.title', count: 1, views: 1 } },
    ]),
    Video.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: '$views' },
          uploads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: { usersByDay, videosByCategory, viewsTrend },
  });
});

exports.getReports = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      summary: 'Platform health report',
      generatedAt: new Date(),
      metrics: {
        activeUsers: await User.countDocuments({ isVerified: true }),
        publishedVideos: await Video.countDocuments({ isPublished: true }),
        activeCreators: await Creator.countDocuments({ isActive: true }),
      },
    },
  });
});

exports.getCreatorRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    User.find({ 'creatorRequest.status': 'pending' })
      .select('name email avatar bio createdAt creatorRequest')
      .sort({ 'creatorRequest.requestedAt': -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ 'creatorRequest.status': 'pending' })
  ]);

  res.json({ 
    success: true, 
    data: requests, 
    pagination: { page, limit, total, pages: Math.ceil(total / limit) } 
  });
});

exports.approveCreatorRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError(404, 'User not found');
  if (user.creatorRequest.status !== 'pending') throw ApiError(400, 'No pending request for this user');

  // Update user
  user.creatorRequest.status = 'approved';
  user.role = 'creator';
  await user.save();

  // Create Creator document with approvalStatus set to 'Approved'
  const creator = await Creator.create({
    userId: user._id,
    displayName: user.name,
    bio: user.bio,
    avatar: user.avatar,
    approvalStatus: 'Approved'
  });

  res.json({ success: true, message: 'Creator request approved', data: { user, creator } });
});

exports.approveCreator = asyncHandler(async (req, res) => {
  const creator = await Creator.findById(req.params.id);
  if (!creator) throw ApiError(404, 'Creator not found');

  creator.approvalStatus = 'Approved';
  await creator.save();

  res.json({ success: true, message: 'Creator approved', data: creator });
});

exports.rejectCreator = asyncHandler(async (req, res) => {
  const creator = await Creator.findById(req.params.id);
  if (!creator) throw ApiError(404, 'Creator not found');

  creator.approvalStatus = 'Rejected';
  await creator.save();

  res.json({ success: true, message: 'Creator rejected', data: creator });
});

exports.rejectCreatorRequest = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError(404, 'User not found');
  if (user.creatorRequest.status !== 'pending') throw ApiError(400, 'No pending request for this user');

  user.creatorRequest.status = 'rejected';
  user.creatorRequest.notes = notes || '';
  await user.save();

  res.json({ success: true, message: 'Creator request rejected', data: user.toPublicJSON() });
});

exports.getAdminMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublicJSON() });
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError(401, 'Invalid admin credentials');
  }

  const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      accessToken: generateAccessToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    },
  });
});
