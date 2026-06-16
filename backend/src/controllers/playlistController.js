const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

exports.createPlaylist = asyncHandler(async (req, res) => {
  const { name, isPrivate } = req.body;
  const playlist = await Playlist.create({
    name,
    user: req.user._id,
    isPrivate: isPrivate || false,
  });
  res.status(201).json({ success: true, data: playlist });
});

exports.getPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ user: req.user._id })
    .populate('videos', 'title thumbnail duration views')
    .sort({ updatedAt: -1 });
  res.json({ success: true, data: playlists });
});

exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id }).populate({
    path: 'videos',
    populate: [{ path: 'creator', select: 'displayName avatar' }, { path: 'category', select: 'title' }],
  });
  if (!playlist) throw ApiError(404, 'Playlist not found');
  res.json({ success: true, data: playlist });
});

exports.updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name: req.body.name, isPrivate: req.body.isPrivate },
    { new: true }
  );
  if (!playlist) throw ApiError(404, 'Playlist not found');
  res.json({ success: true, data: playlist });
});

exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!playlist) throw ApiError(404, 'Playlist not found');
  res.json({ success: true, message: 'Playlist deleted' });
});

exports.addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const video = await Video.findById(videoId);
  if (!video) throw ApiError(404, 'Video not found');

  const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!playlist) throw ApiError(404, 'Playlist not found');

  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
    await playlist.save();
  }

  res.json({ success: true, data: playlist });
});

exports.removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!playlist) throw ApiError(404, 'Playlist not found');

  playlist.videos = playlist.videos.filter((v) => v.toString() !== req.params.videoId);
  await playlist.save();

  res.json({ success: true, data: playlist });
});
