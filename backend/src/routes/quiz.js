import express from 'express';
import { protect } from '../middleware/auth.js';
import Upload from '../models/Upload.js';

const router = express.Router();
router.use(protect);

// Simple quiz generation from upload content
router.post('/generate', async (req, res) => {
  try {
    const { fileIds, questionCount = 5 } = req.body;

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

    // Simple quiz generation
    const questions = [];
    
    uploads.forEach((upload, uploadIndex) => {
      if (upload.topics && upload.topics.length > 0) {
        // Create questions from topics
        upload.topics.slice(0, Math.min(questionCount, 3)).forEach((topic, index) => {
          const questionTypes = ['mcq', 'fill-in-blank', 'true-false'];
          const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
          
          let question;
          
          if (randomType === 'mcq') {
            question = {
              id: `q_${uploadIndex}_${index}`,
              question: `What is the main concept related to "${topic.name}"?`,
              type: 'mcq',
              options: [
                { text: topic.name, isCorrect: true },
                { text: 'Random Option A', isCorrect: false },
                { text: 'Random Option B', isCorrect: false },
                { text: 'Random Option C', isCorrect: false }
              ],
              correctAnswer: topic.name,
              topic: topic.name,
              difficulty: 'medium'
            };
          } else if (randomType === 'fill-in-blank') {
            question = {
              id: `q_${uploadIndex}_${index}`,
              question: `Fill in the blank: The main concept of _____ is important in this topic.`,
              type: 'fill-in-blank',
              correctAnswer: topic.name,
              topic: topic.name,
              difficulty: 'medium'
            };
          } else {
            question = {
              id: `q_${uploadIndex}_${index}`,
              question: `True or False: ${topic.name} is mentioned as an important concept in the document.`,
              type: 'true-false',
              correctAnswer: 'True',
              topic: topic.name,
              difficulty: 'easy'
            };
          }
          
          questions.push(question);
        });
      }
    });

    // Limit to requested count and shuffle
    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);

    res.json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quizId: `quiz_${Date.now()}`,
        title: `Quiz from ${uploads.length} document(s)`,
        description: `Practice quiz generated from your uploaded materials`,
        questions: shuffledQuestions,
        settings: {
          timeLimit: questionCount * 2, // 2 minutes per question
          randomizeQuestions: true,
          showCorrectAnswers: true,
          allowRetake: true
        },
        questionCount: shuffledQuestions.length,
        estimatedTime: shuffledQuestions.length * 2
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
});

export default router;
