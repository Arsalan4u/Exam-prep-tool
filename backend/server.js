import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/database.js';
import errorHandler from './src/middleware/errorHandler.js';

// Routes - ALL IMPORTS AT THE TOP
import authRoutes from './src/routes/auth.js';
import uploadRoutes from './src/routes/upload.js';
import summaryRoutes from './src/routes/summary.js';
import quizRoutes from './src/routes/quiz.js';
import progressRoutes from './src/routes/progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security and middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'ExamPrep Tool Backend is running!',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'POST /api/upload',
      'GET /api/upload/my-uploads',
      'GET /api/upload/public/all',
      'GET /api/upload/public/search',
      'GET /api/upload/:id',
      'DELETE /api/upload/:id',
      'PATCH /api/upload/:id/visibility',
      'GET /api/summary/:id',
      'GET /api/summary/:id/topics',
      'POST /api/quiz/generate',
      'GET /api/progress'
    ]
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'ExamPrep Tool API Server',
    status: 'Running',
    version: '1.0.0'
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    tip: 'Visit /api/health for available endpoints'
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
});
