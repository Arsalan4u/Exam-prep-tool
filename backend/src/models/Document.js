// backend/src/models/Document.js (Create/Update)
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  visibility: { 
    type: String, 
    enum: ['private', 'public'], 
    default: 'private' 
  },
  summary: { type: String },
  keywords: [String],
  topics: [String],
  uploadDate: { type: Date, default: Date.now },
  description: String
}, { timestamps: true });

// Create text index for search functionality
documentSchema.index({ 
  subject: 'text', 
  keywords: 'text', 
  topics: 'text',
  originalName: 'text',
  description: 'text'
});

module.exports = mongoose.model('Document', documentSchema);
