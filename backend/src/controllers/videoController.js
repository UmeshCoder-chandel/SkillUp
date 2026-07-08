const Video = require('../models/Video');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Creator = require('../models/Creator');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

const populateVideo = [
  { path: 'creator', select: 'displayName avatar userId', populate: { path: 'userId', select: 'name' } },
  { path: 'category', select: 'title slug' },
];

exports.getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .populate(populateVideo)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Video.countDocuments(filter),
  ]);

  let likedVideoIds = [];
  if (req.user) {
    const likes = await Like.find({ user: req.user._id, video: { $in: videos.map((v) => v._id) } });
    likedVideoIds = likes.map((l) => l.video.toString());
  }

  const data = videos.map((v) => ({
    ...v.toObject(),
    likeCount: v.likes.length,
    isLiked: likedVideoIds.includes(v._id.toString()),
  }));

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate(populateVideo);
  if (!video || !video.isPublished) throw ApiError(404, 'Video not found');

  video.views += 1;
  await video.save();

  let isLiked = false;
  if (req.user) {
    isLiked = !!(await Like.findOne({ user: req.user._id, video: video._id }));
  }

  res.json({
    success: true,
    data: { ...video.toObject(), likeCount: video.likes.length, isLiked },
  });
});

exports.likeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) throw ApiError(404, 'Video not found');

  const existing = await Like.findOne({ user: req.user._id, video: video._id });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    video.likes = video.likes.filter((id) => id.toString() !== req.user._id.toString());
    await video.save();
    return res.json({ success: true, liked: false, likeCount: video.likes.length });
  }

  await Like.create({ user: req.user._id, video: video._id });
  video.likes.push(req.user._id);
  await video.save();

  const creator = await Creator.findById(video.creator);
  if (creator) {
    await Notification.create({
      user: creator.userId,
      message: `${req.user.name} liked your video "${video.title}"`,
      type: 'like',
      relatedId: video._id,
    });
  }

  res.json({ success: true, liked: true, likeCount: video.likes.length });
});

exports.addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const video = await Video.findById(req.params.id);
  if (!video) throw ApiError(404, 'Video not found');

  const comment = await Comment.create({
    user: req.user._id,
    video: video._id,
    text,
  });

  await comment.populate('user', 'name avatar');

  const creator = await Creator.findById(video.creator);
  if (creator) {
    await Notification.create({
      user: creator.userId,
      message: `${req.user.name} commented on "${video.title}"`,
      type: 'comment',
      relatedId: video._id,
    });
  }
  res.status(201).json({ success: true, data: comment });
 
});

exports.getComments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ video: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ video: req.params.id }),
  ]);

  res.json({
    success: true,
    data: comments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.getVideosByCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { category: req.params.categoryId, isPublished: true };
  const [videos, total] = await Promise.all([
    Video.find(filter).populate(populateVideo).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Video.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: videos,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.shareVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate(populateVideo);
  if (!video) throw ApiError(404, 'Video not found');

  res.json({
    success: true,
    data: {
      deepLinkUrl: `${process.env.MOBILE_URL || 'skilllearn://'}/video/${video._id}`,
      shareUrl: process.env.PUBLIC_URL 
        ? `${process.env.PUBLIC_URL}/video/${video._id}` 
        : `${process.env.MOBILE_URL || 'skilllearn://'}/video/${video._id}`,
      title: video.title,
      thumbnail: video.thumbnail,
      creatorName: video.creator?.displayName || 'Creator',
    },
  });
});
