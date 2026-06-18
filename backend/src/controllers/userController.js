const User = require('../models/User');
const Video = require('../models/Video');
const Playlist = require('../models/Playlist');
const Category = require('../models/Category');
const Creator = require('../models/Creator');
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWatch = user.lastWatchDate ? new Date(user.lastWatchDate) : null;
  lastWatch?.setHours(0, 0, 0, 0);

  // Update streak
  if (!lastWatch || lastWatch < yesterday) {
    // First watch ever or missed a day
    user.dayStreak = 1;
  } else if (lastWatch.getTime() === yesterday.getTime()) {
    // Yesterday was last watch, increment streak
    user.dayStreak += 1;
  }
  // If last watch was today, do nothing to streak

  user.lastWatchDate = new Date();

  // Add XP: 10 XP per video watch
  const existing = user.watchHistory.find((h) => h.video.toString() === videoId);
  if (!existing) {
    user.xp += 10;
  }

  // Update watch history
  if (existing) {
    existing.watchedAt = new Date();
    existing.progress = progress || existing.progress;
  } else {
    user.watchHistory.unshift({ video: videoId, progress: progress || 0 });
    if (user.watchHistory.length > 100) user.watchHistory.pop();
  }

  // Check for badges
  if (user.watchHistory.length <= 1 && !user.badges.includes('first')) {
    user.badges.push('first');
  }
  if (user.dayStreak >= 3 && !user.badges.includes('streak3')) {
    user.badges.push('streak3');
  }
  if (user.dayStreak >= 7 && !user.badges.includes('streak7')) {
    user.badges.push('streak7');
  }
  if (user.dayStreak >= 30 && !user.badges.includes('streak30')) {
    user.badges.push('streak30');
  }
  if (user.xp >= 100 && !user.badges.includes('xp100')) {
    user.badges.push('xp100');
  }
  if (user.xp >= 500 && !user.badges.includes('xp500')) {
    user.badges.push('xp500');
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

exports.requestCreator = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Check if already a creator or already has a pending request
  if (user.role === 'creator') throw ApiError(400, 'You are already a creator');
  if (user.creatorRequest.status === 'pending') throw ApiError(400, 'Your request is already pending');

  const { notes } = req.body;

  user.creatorRequest = {
    status: 'pending',
    requestedAt: new Date(),
    notes: notes || ''
  };

  await user.save();
  
  res.json({ success: true, message: 'Creator request submitted successfully', data: user.toPublicJSON() });
});
