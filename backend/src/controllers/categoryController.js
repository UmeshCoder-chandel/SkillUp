const Category = require('../models/Category');
const Video = require('../models/Video');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

// Helper function to add video count to categories
const addVideoCountToCategories = async (categories) => {
  // Get all category IDs
  const categoryIds = categories.map(cat => cat._id);
  
  // Count published videos for each category
  const videoCounts = await Video.aggregate([
    { $match: { category: { $in: categoryIds }, isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  // Create a map for quick lookup
  const countMap = {};
  videoCounts.forEach(item => {
    countMap[item._id.toString()] = item.count;
  });
  
  // Return categories with videoCount
  return categories.map(cat => ({
    ...cat.toObject(),
    videoCount: countMap[cat._id.toString()] || 0
  }));
};

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ title: 1 });
  const categoriesWithCount = await addVideoCountToCategories(categories);
  res.json({ success: true, data: categoriesWithCount });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError(404, 'Category not found');
  const videoCount = await Video.countDocuments({ category: category._id, isPublished: true });
  res.json({ success: true, data: { ...category.toObject(), videoCount } });
});

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw ApiError(404, 'Category not found');
  const videoCount = await Video.countDocuments({ category: category._id, isPublished: true });
  res.json({ success: true, data: { ...category.toObject(), videoCount } });
});
