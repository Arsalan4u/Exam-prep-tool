// backend/src/routes/library.js (NEW FILE)
const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const authMiddleware = require('../middleware/auth');

router.get('/public', authMiddleware, libraryController.getPublicDocuments);
router.get('/search', authMiddleware, libraryController.searchDocuments);
router.get('/my-documents', authMiddleware, libraryController.getMyDocuments);

module.exports = router;
