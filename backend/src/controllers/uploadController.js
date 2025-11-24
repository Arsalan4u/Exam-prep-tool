import Upload from '../models/Upload.js';
import fs from 'fs';
import path from 'path';
import { 
  generateSummaryWithGemini, 
  extractKeywordsWithGemini,
  extractTopicsWithGemini,
  analyzeTextDifficulty 
} from '../services/geminiService.js';

// ENHANCED TEXT PROCESSING (FALLBACK) WITH STRUCTURED OUTPUT
function enhancedTextProcessing(text) {
  console.log('🧠 Using enhanced custom algorithm with structured output...');
  
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.length > 20);
  const words = cleanText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordCount = words.length;

  // Word frequency
  const wordFreq = {};
  words.forEach(word => {
    const clean = word.replace(/[^a-z]/g, '');
    if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });

  // Remove stopwords
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those', 'are', 'was', 'were', 'been', 'have', 'has', 'had']);
  Object.keys(wordFreq).forEach(word => {
    if (stopWords.has(word)) delete wordFreq[word];
  });

  // Score sentences
  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
    const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    let positionBoost = index < 2 ? 1.5 : index > sentences.length - 3 ? 1.2 : 1;
    return { sentence, score: score * positionBoost, index };
  });

  // Select top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .sort((a, b) => a.index - b.index);

  // Extract keywords
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word, freq]) => ({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      score: freq / wordCount,
      frequency: freq
    }));

  // Create topics from keywords
  const topics = keywords.slice(0, 6).map((k, i) => ({
    name: k.word,
    keywords: [k.word],
    importance: 1 - (i * 0.1),
    frequency: k.frequency,
    context: ''
  }));

  // BUILD STRUCTURED SUMMARY
  const overview = topSentences.slice(0, 2).map(s => s.sentence).join(' ');
  
  const keyConcepts = topSentences.slice(2, 5).map(s => `• ${s.sentence}`).join('\n');
  
  const importantPoints = topSentences.slice(5, 8).map(s => `• ${s.sentence}`).join('\n');
  
  const keyTakeaways = [
    `• Main focus: ${keywords[0]?.word || 'N/A'}, ${keywords[1]?.word || 'N/A'}, and ${keywords[2]?.word || 'N/A'}`,
    `• Document contains ${sentences.length} key sentences across ${wordCount} words`,
    `• Primary topics include: ${topics.slice(0, 3).map(t => t.name).join(', ')}`
  ].join('\n');

  const structuredSummary = `📚 TOPIC OVERVIEW
${overview}

🔑 KEY CONCEPTS
${keyConcepts}

💡 IMPORTANT POINTS
${importantPoints}

✅ KEY TAKEAWAYS
${keyTakeaways}`;

  // Difficulty
  const avgWordsPerSentence = wordCount / sentences.length;
  const difficulty = avgWordsPerSentence > 25 ? 'hard' : avgWordsPerSentence < 15 ? 'easy' : 'medium';

  return {
    summary: structuredSummary,
    keywords,
    topics,
    wordCount,
    sentences: sentences.length,
    difficulty,
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
    uniqueWordRatio: Math.round((Object.keys(wordFreq).length / wordCount) * 100),
    compressionRatio: Math.round((structuredSummary.length / cleanText.length) * 100)
  };
}

// GEMINI-POWERED TEXT PROCESSING
async function geminiTextProcessing(text) {
  try {
    console.log('🤖 Processing with Gemini AI...');
    
    // Run all analyses in parallel for speed
    const [summary, keywords, topics, difficulty] = await Promise.all([
      generateSummaryWithGemini(text, { sentenceCount: 5 }),
      extractKeywordsWithGemini(text),
      extractTopicsWithGemini(text),
      analyzeTextDifficulty(text)
    ]);

    // Calculate basic stats
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgWordsPerSentence = Math.round(wordCount / Math.max(sentences.length, 1));
    const uniqueWords = new Set(words);
    const uniqueWordRatio = Math.round((uniqueWords.size / wordCount) * 100);
    const compressionRatio = Math.round((summary.length / text.length) * 100);

    console.log('✅ Gemini processing complete');

    return {
      summary,
      keywords,
      topics,
      wordCount,
      sentences: sentences.length,
      difficulty,
      avgWordsPerSentence,
      uniqueWordRatio,
      compressionRatio
    };
    
  } catch (error) {
    console.error('❌ Gemini processing failed, falling back to custom algorithm:', error.message);
    return enhancedTextProcessing(text);
  }
}

// UPLOAD FILE FUNCTION WITH NEW METADATA FIELDS
export const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📋 Form data:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Extract metadata from request body
    const { 
      fileType, 
      subject, 
      semester, 
      visibility, 
      description 
    } = req.body;

    let extractedText = '';
    let pageCount = 1;

    // Extract text based on file type
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('📄 Processing PDF file...');
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
        pageCount = pdfData.numpages || 1;
        console.log('✅ PDF processed:', pdfData.numpages, 'pages');

      } else if (req.file.mimetype === 'text/plain') {
        console.log('📄 Processing TXT file...');
        extractedText = fs.readFileSync(req.file.path, 'utf8');
        console.log('✅ TXT processed');
      } else {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false,
          message: 'Currently supporting PDF and TXT files only' 
        });
      }
    } catch (fileError) {
      console.error('❌ File processing error:', fileError);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: `Failed to process file: ${fileError.message}` 
      });
    }

    if (!extractedText.trim()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'File appears to be empty' 
      });
    }

    // Choose processing method
    const useGemini = process.env.GEMINI_API_KEY && process.env.SUMMARY_MODE === 'gemini';
    
    let processed;
    try {
      if (useGemini) {
        console.log('🤖 Using Gemini AI for processing...');
        processed = await geminiTextProcessing(extractedText);
      } else {
        console.log('🧠 Using custom enhanced algorithm...');
        processed = enhancedTextProcessing(extractedText);
      }
    } catch (processingError) {
      console.error('❌ Processing error:', processingError.message);
      console.log('⚠️ Using fallback processing...');
      processed = enhancedTextProcessing(extractedText);
    }

    // Final validation
    if (!processed || typeof processed.wordCount === 'undefined') {
      console.error('❌ Invalid processing result, creating safe fallback');
      const words = extractedText.split(/\s+/).filter(w => w.length > 0);
      processed = {
        summary: extractedText.substring(0, 500).trim() + (extractedText.length > 500 ? '...' : ''),
        keywords: [],
        topics: [],
        wordCount: words.length,
        sentences: extractedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        difficulty: 'medium',
        avgWordsPerSentence: 15,
        uniqueWordRatio: 50,
        compressionRatio: 10
      };
    }

    // Clean summary - remove any encoding issues
    const cleanedSummary = processed.summary
      .replace(/□/g, '•')
      .replace(/\u25a1/g, '•')
      .replace(/\*/g, '•');
    
    const readingTime = Math.ceil(processed.wordCount / 200);

    console.log('✅ Processing complete:', {
      method: useGemini ? 'Gemini AI' : 'Custom Algorithm',
      wordCount: processed.wordCount,
      summaryLength: cleanedSummary.length,
      compressionRatio: processed.compressionRatio + '%',
      keywords: processed.keywords?.length || 0,
      topics: processed.topics?.length || 0,
      subject: subject || 'General',
      semester: semester || 'N/A',
      visibility: visibility || 'private'
    });

    // Save to database with NEW metadata fields
    const upload = new Upload({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: fileType || 'notes',
      mimeType: req.file.mimetype,
      size: req.file.size,
      
      // NEW FIELDS
      subject: subject || 'General',
      semester: semester || 'N/A',
      visibility: visibility || 'private',
      description: description || '',
      
      extractedText,
      summary: cleanedSummary,
      keywords: processed.keywords || [],
      topics: processed.topics || [],
      metadata: {
        wordCount: processed.wordCount,
        readingTime,
        pageCount,
        difficulty: processed.difficulty,
        avgWordsPerSentence: processed.avgWordsPerSentence,
        uniqueWordRatio: processed.uniqueWordRatio,
        sentences: processed.sentences,
        compressionRatio: processed.compressionRatio,
        aiProcessed: useGemini
      },
      processed: true
    });

    await upload.save();
    console.log('🎉 Upload saved successfully with metadata!');

    res.status(201).json({
      success: true,
      message: useGemini 
        ? 'File processed with Gemini AI' 
        : 'File processed with enhanced algorithm',
      data: {
        id: upload._id,
        _id: upload._id,
        originalName: upload.originalName,
        fileType: upload.fileType,
        subject: upload.subject,
        semester: upload.semester,
        visibility: upload.visibility,
        size: upload.size,
        summary: upload.summary,
        keywords: upload.keywords.slice(0, 5),
        topics: upload.topics.slice(0, 3),
        metadata: upload.metadata,
        createdAt: upload.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed: ' + error.message
    });
  }
};

// GET USER UPLOADS (all - both private and public)
export const getUserUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText')
      .limit(50);

    console.log('📊 Found uploads:', uploads.length);

    res.json({
      success: true,
      count: uploads.length,
      data: uploads
    });
  } catch (error) {
    console.error('❌ Get uploads error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch uploads',
      error: error.message 
    });
  }
};

// GET PUBLIC UPLOADS (for library feature)
export const getPublicUploads = async (req, res) => {
  try {
    const { subject, semester, search } = req.query;
    
    let query = { visibility: 'public' };
    
    // Filter by subject if provided
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Filter by semester if provided
    if (semester && semester !== 'all') {
      query.semester = semester;
    }
    
    // Search in multiple fields
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'keywords.word': { $regex: search, $options: 'i' } }
      ];
    }
    
    const uploads = await Upload.find(query)
      .populate('user', 'name email')
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('📚 Found public uploads:', uploads.length);

    res.json({
      success: true,
      count: uploads.length,
      data: uploads
    });
  } catch (error) {
    console.error('❌ Get public uploads error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch public uploads',
      error: error.message 
    });
  }
};

// SEARCH UPLOADS (with text search)
export const searchUploads = async (req, res) => {
  try {
    const { query, subject, semester } = req.query;
    
    let searchQuery = { visibility: 'public' };
    
    // Text search across multiple fields
    if (query) {
      searchQuery.$or = [
        { originalName: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'keywords.word': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filter by subject
    if (subject && subject !== 'all') {
      searchQuery.subject = subject;
    }
    
    // Filter by semester
    if (semester && semester !== 'all') {
      searchQuery.semester = semester;
    }
    
    const uploads = await Upload.find(searchQuery)
      .populate('user', 'name email')
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('🔍 Search results:', uploads.length);

    res.json({
      success: true,
      count: uploads.length,
      data: uploads
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Search failed',
      error: error.message 
    });
  }
};

// GET UPLOAD BY ID (with visibility check)
export const getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id)
      .populate('user', 'name email');

    if (!upload) {
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found' 
      });
    }

    // Check if user has access (owner or public document)
    if (upload.visibility === 'private' && upload.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. This document is private.' 
      });
    }

    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch upload',
      error: error.message 
    });
  }
};

// DELETE UPLOAD (only by owner)
export const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!upload) {
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found or you do not have permission to delete' 
      });
    }

    const filePath = path.join('./uploads', upload.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Upload.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete upload',
      error: error.message 
    });
  }
};

// UPDATE UPLOAD VISIBILITY (toggle private/public)
export const updateUploadVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;
    
    if (!['private', 'public'].includes(visibility)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Visibility must be either "private" or "public"' 
      });
    }

    const upload = await Upload.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { visibility },
      { new: true }
    );

    if (!upload) {
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found' 
      });
    }

    res.json({
      success: true,
      message: `Upload visibility updated to ${visibility}`,
      data: upload
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update visibility',
      error: error.message 
    });
  }
};
