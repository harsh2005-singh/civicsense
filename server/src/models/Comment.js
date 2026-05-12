const mongoose = require('mongoose');
const crypto = require('crypto');

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [5000, 'Comment too long'],
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
      required: [true, 'Bill ID is required'],
    },
    source: {
      type: String,
      enum: ['manual', 'csv', 'api'],
      default: 'manual',
    },
    submittedBy: {
      type: String,
      default: 'anonymous',
    },
    hash: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    // AI results
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative', null],
      default: null,
    },
    sentimentScore: {
      type: Number,
      default: null,
    },
    keywords: [
      {
        word: String,
        weight: Number,
        entityType: String,
      },
    ],
    summary: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// auto-generate hash before saving to deduplicate
commentSchema.pre('save', function (next) {
  if (!this.hash) {
    this.hash = crypto
      .createHash('md5')
      .update(this.text + this.billId.toString())
      .digest('hex');
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema);