const Video = require('../models/Video');
const Creator = require('../models/Creator');
const Category = require('../models/Category');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

exports.search = asyncHandler(async (req, res) => {
  const { q, type = 'all', page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: { videos: [], creators: [], categories: [], users: [] } });
  }

  const regex = new RegExp(q.trim(), 'i');
  const results = { videos: [], creators: [], categories: [], users: [] };

  if (type === 'all' || type === 'videos') {
    results.videos = await Video.find({
      isPublished: true,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .populate('creator', 'displayName avatar')
      .populate('category', 'title')
      .skip(skip)
      .limit(parseInt(limit, 10));
  }

  if (type === 'all' || type === 'creators') {
    results.creators = await Creator.find({
      isActive: true,
      $or: [{ displayName: regex }, { bio: regex }],
    })
      .populate('userId', 'name avatar')
      .skip(skip)
      .limit(parseInt(limit, 10));
  }

  if (type === 'all' || type === 'categories') {
    results.categories = await Category.find({
      isActive: true,
      $or: [{ title: regex }, { description: regex }],
    })
      .skip(skip)
      .limit(parseInt(limit, 10));
  }

  if (type === 'all' || type === 'skills') {
    results.categories = await Category.find({ isActive: true, title: regex }).limit(parseInt(limit, 10));
  }

  res.json({ success: true, data: results, query: q });
});
