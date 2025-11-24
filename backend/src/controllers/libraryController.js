// backend/src/controllers/libraryController.js (NEW FILE)
const Document = require('../models/Document');

// Get public documents
exports.getPublicDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ visibility: 'public' })
      .populate('userId', 'name email')
      .sort({ uploadDate: -1 })
      .limit(50);
    
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};

// Search documents by subject/keywords
exports.searchDocuments = async (req, res) => {
  try {
    const { query, subject, semester } = req.query;
    
    let searchQuery = { visibility: 'public' };
    
    // Text search
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    // Filter by subject
    if (subject) {
      searchQuery.subject = subject;
    }
    
    // Filter by semester
    if (semester) {
      searchQuery.semester = semester;
    }
    
    const documents = await Document.find(searchQuery)
      .populate('userId', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);
    
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error });
  }
};

// Get user's own documents (private + public)
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .sort({ uploadDate: -1 });
    
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};
