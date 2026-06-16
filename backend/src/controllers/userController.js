const User = require('../models/User');
const Video = require('../models/Video');
const Playlist = require('../models/Playlist');
const Category = require('../models/Category');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedVideos', 'title thumbnail duration views')
    .select('-password -refreshToken -otp');

  const playlists = await Playlist.find({ user: req.user._id }).populate('videos', 'title thumbnail duration');

  res.json({
    success: true,
    data: { user, playlists },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, interests } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (interests) updates.interests = interests;

  if (req.file?.path) {
    updates.avatar = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json({ success: true, data: user.toPublicJSON() });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name avatar bio interests createdAt role');
  if (!user) throw ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

exports.saveVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = await User.findById(req.user._id);
  const index = user.savedVideos.indexOf(videoId);

  if (index > -1) {
    user.savedVideos.splice(index, 1);
    await user.save();
    return res.json({ success: true, message: 'Video removed from saved', saved: false });
  }

  user.savedVideos.push(videoId);
  await user.save();
  res.json({ success: true, message: 'Video saved', saved: true });
});

exports.getSavedVideos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedVideos',
    populate: [{ path: 'creator', select: 'displayName avatar' }, { path: 'category', select: 'title' }],
  });

  res.json({ success: true, data: user.savedVideos });
});

exports.addWatchHistory = asyncHandler(async (req, res) => {
  const { videoId, progress } = req.body;
  const user = await User.findById(req.user._id);

  const existing = user.watchHistory.find((h) => h.video.toString() === videoId);
  if (existing) {
    existing.watchedAt = new Date();
    existing.progress = progress || existing.progress;
  } else {
    user.watchHistory.unshift({ video: videoId, progress: progress || 0 });
    if (user.watchHistory.length > 100) user.watchHistory.pop();
  }

  await user.save();
  res.json({ success: true, message: 'Watch history updated' });
});

exports.getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'watchHistory.video',
    populate: [{ path: 'creator', select: 'displayName avatar' }, { path: 'category', select: 'title' }],
  });

  res.json({ success: true, data: user.watchHistory });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const continueLearning = await Video.find({
    _id: { $in: user.watchHistory.slice(0, 5).map((h) => h.video) },
  })
    .populate('creator', 'displayName avatar')
    .populate('category', 'title')
    .limit(5);

  const recentlyWatched = user.watchHistory.slice(0, 10);
  const populatedRecent = await User.findById(req.user._id).populate({
    path: 'watchHistory.video',
    populate: [{ path: 'creator', select: 'displayName avatar' }, { path: 'category', select: 'title' }],
  });

  let recommendedQuery = {};
  if (user.interests?.length) {
    const categories = await Category.find({ title: { $in: user.interests } });
    if (categories.length) {
      recommendedQuery.category = { $in: categories.map((c) => c._id) };
    }
  }

  const recommended = await Video.find({ ...recommendedQuery, isPublished: true })
    .populate('creator', 'displayName avatar')
    .populate('category', 'title')
    .sort({ views: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      continueLearning,
      recentlyWatched: populatedRecent.watchHistory,
      recommended,
      savedCount: user.savedVideos.length,
    },
  });
});
