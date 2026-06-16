const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 1000 },
    thumbnail: { type: String, required: true },
    videoUrl: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ creator: 1 });

module.exports = mongoose.model('Video', videoSchema);
