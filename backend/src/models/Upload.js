import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['notes', 'pyq', 'syllabus', 'other'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  summary: String,
  keywords: [{
    word: String,
    score: Number
  }],
  topics: [{
    name: String,
    importance: Number,
    frequency: Number
  }],
  metadata: {
    pageCount: Number,
    wordCount: Number,
    readingTime: Number,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

uploadSchema.index({ user: 1, createdAt: -1 });
uploadSchema.index({ fileType: 1 });

export default mongoose.model('Upload', uploadSchema);
