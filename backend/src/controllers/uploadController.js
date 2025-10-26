import Upload from '../models/Upload.js';
import fs from 'fs';
import path from 'path';

// Enhanced text processing function (same as before)
function enhancedTextProcessing(text) {
  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const words = cleanText
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^a-zA-Z]/g, ''))
    .filter(word => word.length > 2);

  const wordCount = words.length;

  let summary;
  if (sentences.length >= 3) {
    const wordFreq = {};
    words.forEach(word => {
      if (!isStopWord(word)) {
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
      .slice(0, 3)
      .sort((a, b) => a.index - b.index);

    summary = topSentences.map(s => s.sentence).join(' ');
  } else {
    summary = cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : '');
  }

  const stopWords = getStopWords();
  const wordFreq = {};
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word, freq]) => ({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      score: freq / wordCount
    }));

  const topics = extractTopics(keywords, cleanText);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  const uniqueWordRatio = Object.keys(wordFreq).length / wordCount;
  
  let difficulty;
  if (wordCount > 2000 && avgWordsPerSentence > 20 && uniqueWordRatio > 0.4) {
    difficulty = 'hard';
  } else if (wordCount > 800 && avgWordsPerSentence > 15) {
    difficulty = 'medium';
  } else {
    difficulty = 'easy';
  }

  return { 
    summary, 
    keywords, 
    topics, 
    wordCount, 
    sentences: sentences.length,
    difficulty,
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
    uniqueWordRatio: Math.round(uniqueWordRatio * 100)
  };
}

function isStopWord(word) {
  const stopWords = getStopWords();
  return stopWords.has(word.toLowerCase());
}

function getStopWords() {
  return new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'a', 'an', 'as', 'if', 'it', 'its', 'then', 'than', 'only', 'also', 'just', 'very',
    'so', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'own', 'same'
  ]);
}

function extractTopics(keywords, text) {
  const topics = [];
  const processedKeywords = new Set();

  keywords.forEach(keyword => {
    if (processedKeywords.has(keyword.word)) return;

    const relatedKeywords = keywords.filter(k => 
      !processedKeywords.has(k.word) && 
      (k.word.toLowerCase().includes(keyword.word.toLowerCase().substring(0, 4)) || 
       keyword.word.toLowerCase().includes(k.word.toLowerCase().substring(0, 4)))
    );

    if (relatedKeywords.length > 0) {
      const topic = {
        name: keyword.word,
        keywords: relatedKeywords.map(k => k.word),
        importance: relatedKeywords.reduce((sum, k) => sum + k.score, 0) / relatedKeywords.length,
        frequency: relatedKeywords.length
      };
      
      topics.push(topic);
      relatedKeywords.forEach(k => processedKeywords.add(k.word));
    }
  });

  return topics.slice(0, 8).sort((a, b) => b.importance - a.importance);
}

export const uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📁 File:', req.file ? req.file.originalname : 'No file'); 
    console.log('📊 File size:', req.file ? (req.file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A');
    console.log('🎯 File type:', req.file ? req.file.mimetype : 'Unknown');

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { fileType } = req.body;
    let extractedText = '';
    let pageCount = 1;

    // Extract text based on file type
    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log('📄 Processing PDF file...');
        
        // Dynamic import to avoid initialization issues
        const pdfParse = (await import('pdf-parse')).default;
        
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
        pageCount = pdfData.numpages || 1;
        console.log('✅ PDF processed:', pdfData.numpages, 'pages,', extractedText.length, 'characters');

      } else if (req.file.mimetype === 'text/plain') {
        console.log('📄 Processing TXT file...');
        extractedText = fs.readFileSync(req.file.path, 'utf8');
        console.log('✅ TXT processed:', extractedText.length, 'characters');

      } else {
        // Clean up unsupported file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false,
          message: 'Currently supporting PDF and TXT files. More formats coming soon!' 
        });
      }
    } catch (fileError) {
      console.error('❌ File processing error:', fileError.message);
      
      // Clean up file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({ 
        success: false,
        message: `Failed to process file: ${fileError.message}. Please ensure the file is not corrupted.` 
      });
    }

    if (!extractedText.trim()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        message: 'File appears to be empty or text could not be extracted' 
      });
    }

    // Process text with enhanced algorithms
    console.log('🧠 Processing text with enhanced NLP...');
    const processed = enhancedTextProcessing(extractedText);
    const readingTime = Math.ceil(processed.wordCount / 200);

    console.log('✅ Text processed successfully:', {
      wordCount: processed.wordCount,
      sentences: processed.sentences,
      keywords: processed.keywords.length,
      topics: processed.topics.length,
      difficulty: processed.difficulty,
      avgWordsPerSentence: processed.avgWordsPerSentence,
      uniqueWordRatio: processed.uniqueWordRatio + '%'
    });

    // Save to database
    const upload = new Upload({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: fileType || 'notes',
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
      summary: processed.summary,
      keywords: processed.keywords,
      topics: processed.topics,
      metadata: {
        wordCount: processed.wordCount,
        readingTime,
        pageCount,
        difficulty: processed.difficulty,
        avgWordsPerSentence: processed.avgWordsPerSentence,
        uniqueWordRatio: processed.uniqueWordRatio,
        sentences: processed.sentences
      },
      processed: true
    });

    console.log('💾 Saving to database...');
    await upload.save();
    console.log('🎉 Upload saved successfully! ID:', upload._id);

    res.status(201).json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        id: upload._id,
        originalName: upload.originalName,
        fileType: upload.fileType,
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
      message: 'File upload failed: ' + error.message,
      error: error.message 
    });
  }
};

// Keep other functions the same
export const getUserUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText')
      .limit(50);

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

export const getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!upload) {
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found' 
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

export const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!upload) {
      return res.status(404).json({ 
        success: false, 
        message: 'Upload not found' 
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
