const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, creator: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
