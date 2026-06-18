const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    interests: [{ type: String }],
    role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    creatorRequest: {
      status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
      requestedAt: Date,
      notes: { type: String, default: '' }
    },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    firebaseUid: { type: String, sparse: true },
    watchHistory: [
      {
        video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
        watchedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
      },
    ],
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    dayStreak: { type: Number, default: 0 },
    lastWatchDate: { type: Date },
    xp: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    interests: this.interests,
    role: this.role,
    isVerified: this.isVerified,
    creatorRequest: this.creatorRequest,
    createdAt: this.createdAt,
    dayStreak: this.dayStreak,
    xp: this.xp,
    badges: this.badges,
  };
};

// Add indexes
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

module.exports = mongoose.model('User', userSchema);
