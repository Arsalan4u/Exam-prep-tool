import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { 
  uploadFile, 
  getUserUploads, 
  getUploadById, 
  deleteUpload,
  getPublicUploads,
  searchUploads,
  updateUploadVisibility 
} from '../controllers/uploadController.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Upload file with metadata
router.post('/', protect, upload.single('file'), uploadFile);

// Get user's own uploads
router.get('/my-uploads', protect, getUserUploads);

// Get all public uploads (library)
router.get('/public/all', protect, getPublicUploads);

// Search public uploads
router.get('/public/search', protect, searchUploads);

// Update upload visibility
router.patch('/:id/visibility', protect, updateUploadVisibility);

// Get specific upload by ID
router.get('/:id', protect, getUploadById);

// Delete upload
router.delete('/:id', protect, deleteUpload);

export default router;
