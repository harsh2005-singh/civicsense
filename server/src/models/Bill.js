const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    billNumber: {
      type: String,
      required: [true, 'Bill number is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'archived'],
      default: 'draft',
    },
    category: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    summary: {
      type: String,
      default: null,
    },
    topics: [
      {
        label: String,
        keywords: [String],
        count: Number,
      },
    ],
    totalComments: {
      type: Number,
      default: 0,
    },
    sentimentStats: {
      positive: { type: Number, default: 0 },
      neutral:  { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);