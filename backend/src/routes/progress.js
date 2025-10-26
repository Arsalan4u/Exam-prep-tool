import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

// Get user progress dashboard
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Mock data for now - you can enhance this later
    const mockData = {
      user: {
        name: user.name,
        email: user.email,
        joinDate: user.createdAt,
        stats: user.stats
      },
      overview: {
        totalUploads: 0,
        totalQuizzes: user.stats.totalQuizzes,
        totalAttempts: 0,
        averageScore: user.stats.averageScore,
        recentActivity: {
          quizzesThisMonth: 0,
          uploadsThisMonth: 0
        }
      },
      topicAccuracy: [],
      weeklyProgress: [],
      recentQuizzes: []
    };

    res.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
});

export default router;
