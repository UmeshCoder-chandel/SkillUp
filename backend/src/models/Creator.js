const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalVideos: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    approvalStatus: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected'], 
      default: 'Approved' 
    },
  },
  { timestamps: true }
);

creatorSchema.virtual('followerCount').get(function () {
  return this.followers?.length || 0;
});

// Add indexes
creatorSchema.index({ isActive: 1, totalVideos: -1 });
creatorSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Creator', creatorSchema);
