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
  
  // NEW METADATA FIELDS
  subject: {
    type: String,
    default: 'General'
  },
  semester: {
    type: String,
    default: 'N/A'
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  description: {
    type: String,
    default: ''
  },
  
  extractedText: {
    type: String
  },
  summary: {
    type: String
  },
  keywords: [{
    word: String,
    score: Number,
    frequency: Number
  }],
  topics: [{
    name: String,
    keywords: [String],
    importance: Number,
    frequency: Number,
    context: String
  }],
  metadata: {
    wordCount: Number,
    readingTime: Number,
    pageCount: Number,
    difficulty: String,
    avgWordsPerSentence: Number,
    uniqueWordRatio: Number,
    sentences: Number,
    compressionRatio: Number,
    aiProcessed: Boolean
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create text index for search functionality
uploadSchema.index({ 
  subject: 'text', 
  originalName: 'text',
  description: 'text',
  'keywords.word': 'text'
});

export default mongoose.model('Upload', uploadSchema);
