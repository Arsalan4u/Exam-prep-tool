import express from 'express';
import { protect } from '../middleware/auth.js';
import Upload from '../models/Upload.js';
import mongoose from 'mongoose';

const router = express.Router();
router.use(protect);

// Simple text processing function
function generateSummary(text, length = 3) {
  if (!text || text.trim().length === 0) {
    return 'No content available to summarize.';
  }

  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  if (sentences.length <= length) {
    return sentences.join('. ') + '.';
  }

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^a-zA-Z]/g, ''))
    .filter(word => word.length > 2);

  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did'
  ]);

  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = sentenceWords.reduce((sum, word) => {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      return sum + (wordFreq[cleanWord] || 0);
    }, 0);
    
    const positionBoost = Math.max(0.5, 1 - (index / sentences.length) * 0.3);
    
    return {
      sentence: sentence + '.',
      score: score * positionBoost,
      index
    };
  });

  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, length)
    .sort((a, b) => a.index - b.index);

  return topSentences.map(s => s.sentence).join(' ');
}

// Get summary for a specific upload
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { length = 3 } = req.query;

    console.log('📖 Summary request for ID:', id); // Debug log
    console.log('👤 User:', req.user._id); // Debug log

    // Validate ObjectId
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID provided'
      });
    }

    const upload = await Upload.findOne({
      _id: id,
      user: req.user._id
    });

    if (!upload) {
      console.log('❌ Document not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    console.log('✅ Document found:', upload.originalName);

    // If summary exists and length matches, return it
    if (upload.summary && length == 3) {
      console.log('📋 Returning existing summary');
      return res.json({
        success: true,
        data: {
          summary: upload.summary,
          originalLength: upload.extractedText ? upload.extractedText.split('.').length : 0,
          summaryLength: upload.summary.split('.').length,
          compressionRatio: upload.extractedText ? Math.round((upload.summary.length / upload.extractedText.length) * 100) : 0,
          readingTime: Math.ceil(upload.summary.split(' ').length / 200),
          documentTitle: upload.originalName,
          wordCount: upload.metadata?.wordCount || 0,
          topics: upload.topics || [],
          keywords: upload.keywords || []
        }
      });
    }

    // Generate new summary
    console.log('🧠 Generating new summary...');
    const summary = generateSummary(upload.extractedText, parseInt(length));

    // Update upload if default length
    if (length == 3) {
      upload.summary = summary;
      await upload.save();
      console.log('💾 Updated document with new summary');
    }

    res.json({
      success: true,
      data: {
        summary,
        originalLength: upload.extractedText ? upload.extractedText.split('.').length : 0,
        summaryLength: summary.split('.').length,
        compressionRatio: upload.extractedText ? Math.round((summary.length / upload.extractedText.length) * 100) : 0,
        readingTime: Math.ceil(summary.split(' ').length / 200),
        documentTitle: upload.originalName,
        wordCount: upload.metadata?.wordCount || 0,
        topics: upload.topics || [],
        keywords: upload.keywords || []
      }
    });

  } catch (error) {
    console.error('❌ Summary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

// Get topics for a specific upload
router.get('/:id/topics', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Topics request for ID:', id);

    // Validate ObjectId
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID provided'
      });
    }

    const upload = await Upload.findOne({
      _id: id,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: {
        topics: upload.topics || [],
        keywords: upload.keywords || [],
        metadata: upload.metadata || {},
        documentTitle: upload.originalName
      }
    });

  } catch (error) {
    console.error('❌ Topics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get topics',
      error: error.message
    });
  }
});

export default router;
