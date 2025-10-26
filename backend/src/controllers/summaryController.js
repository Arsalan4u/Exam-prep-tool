import Upload from '../models/Upload.js';
import TextRank from '../utils/textRank.js';

export const getSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { length = 3 } = req.query;

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

    // If summary already exists and length matches, return it
    if (upload.summary && length == 3) {
      return res.json({
        success: true,
        data: {
          summary: upload.summary,
          originalLength: upload.extractedText.split('.').length,
          summaryLength: upload.summary.split('.').length,
          compressionRatio: Math.round((upload.summary.length / upload.extractedText.length) * 100)
        }
      });
    }

    // Generate new summary with specified length
    const textRank = new TextRank();
    const summaryArray = textRank.summarize(upload.extractedText, parseInt(length));
    const summary = summaryArray.join(' ');

    // Update upload with new summary if it's the default length
    if (length == 3) {
      upload.summary = summary;
      await upload.save();
    }

    res.json({
      success: true,
      data: {
        summary,
        originalLength: upload.extractedText.split('.').length,
        summaryLength: summaryArray.length,
        compressionRatio: Math.round((summary.length / upload.extractedText.length) * 100),
        readingTime: Math.ceil(summary.split(' ').length / 200) // Reading time in minutes
      }
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
};

export const getBulkSummary = async (req, res) => {
  try {
    const { fileIds } = req.body;
    const { length = 3 } = req.query;

    if (!fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({
        success: false,
        message: 'File IDs array is required'
      });
    }

    const uploads = await Upload.find({
      _id: { $in: fileIds },
      user: req.user._id
    });

    if (uploads.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No documents found'
      });
    }

    // Combine all extracted text
    const combinedText = uploads.map(upload => upload.extractedText).join('\n\n');

    // Generate summary
    const textRank = new TextRank();
    const summaryArray = textRank.summarize(combinedText, parseInt(length));
    const summary = summaryArray.join(' ');

    res.json({
      success: true,
      data: {
        summary,
        sourceFiles: uploads.map(u => ({
          id: u._id,
          name: u.originalName,
          type: u.fileType
        })),
        originalLength: combinedText.split('.').length,
        summaryLength: summaryArray.length,
        compressionRatio: Math.round((summary.length / combinedText.length) * 100)
      }
    });

  } catch (error) {
    console.error('Bulk summary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk summary',
      error: error.message
    });
  }
};

export const getKeyTopics = async (req, res) => {
  try {
    const { id } = req.params;

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
        topics: upload.topics,
        keywords: upload.keywords,
        metadata: upload.metadata
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get topics',
      error: error.message
    });
  }
};
