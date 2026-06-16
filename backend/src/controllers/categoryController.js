const Category = require('../models/Category');
const { ApiError, asyncHandler } = require('../utils/asyncHandler');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ title: 1 });
  res.json({ success: true, data: categories });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});

exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});
