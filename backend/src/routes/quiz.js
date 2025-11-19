import express from 'express';
import { protect } from '../middleware/auth.js';
import Upload from '../models/Upload.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();
router.use(protect);

// Helper function to generate different question types
function generateQuestions(upload, questionCount = 10) {
  const questions = [];
  const { extractedText, keywords, topics, summary } = upload;
  
  // Split text into sentences
  const sentences = extractedText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200);

  // 1. Generate MCQs from keywords (40%)
  const mcqCount = Math.ceil(questionCount * 0.4);
  keywords.slice(0, mcqCount).forEach((keyword, index) => {
    const relevantSentence = sentences.find(s => 
      s.toLowerCase().includes(keyword.word.toLowerCase())
    );
    
    if (relevantSentence) {
      // Create question by removing the keyword
      const questionText = relevantSentence.replace(
        new RegExp(keyword.word, 'gi'), 
        '______'
      );
      
      // Generate distractors (wrong options)
      const distractors = keywords
        .filter(k => k.word !== keyword.word)
        .slice(0, 3)
        .map(k => k.word);
      
      questions.push({
        id: `mcq_${index}`,
        type: 'mcq',
        question: `Fill in the blank: ${questionText}`,
        options: shuffleArray([
          { text: keyword.word, isCorrect: true },
          ...distractors.map(d => ({ text: d, isCorrect: false }))
        ]),
        correctAnswer: keyword.word,
        difficulty: determineDifficulty(keyword.score),
        topic: topics[index % topics.length]?.name || 'General',
        explanation: `The keyword "${keyword.word}" appears ${Math.round(keyword.score * 100)} times in the context.`
      });
    }
  });

  // 2. Generate True/False from topics (30%)
  const tfCount = Math.ceil(questionCount * 0.3);
  topics.slice(0, tfCount).forEach((topic, index) => {
    const topicSentence = sentences.find(s => 
      s.toLowerCase().includes(topic.name.toLowerCase())
    );
    
    if (topicSentence) {
      const isTrue = Math.random() > 0.5;
      const statement = isTrue 
        ? topicSentence
        : topicSentence.replace(
            new RegExp(topic.name, 'gi'),
            keywords[Math.floor(Math.random() * keywords.length)].word
          );
      
      questions.push({
        id: `tf_${index}`,
        type: 'true-false',
        question: statement,
        correctAnswer: isTrue ? 'True' : 'False',
        difficulty: 'easy',
        topic: topic.name,
        explanation: isTrue 
          ? 'This statement is directly from the document.'
          : 'This statement has been modified and is incorrect.'
      });
    }
  });

  // 3. Generate Fill-in-the-Blank (30%)
  const fibCount = questionCount - questions.length;
  sentences.slice(0, fibCount * 2).forEach((sentence, index) => {
    if (questions.length >= questionCount) return;
    
    // Find a keyword in the sentence
    const sentenceKeyword = keywords.find(k => 
      sentence.toLowerCase().includes(k.word.toLowerCase())
    );
    
    if (sentenceKeyword) {
      const blankedSentence = sentence.replace(
        new RegExp(sentenceKeyword.word, 'gi'),
        '______'
      );
      
      questions.push({
        id: `fib_${index}`,
        type: 'fill-in-blank',
        question: blankedSentence,
        correctAnswer: sentenceKeyword.word.toLowerCase(),
        acceptedAnswers: [
          sentenceKeyword.word.toLowerCase(),
          sentenceKeyword.word,
          sentenceKeyword.word.toUpperCase()
        ],
        difficulty: determineDifficulty(sentenceKeyword.score),
        topic: topics[index % topics.length]?.name || 'General',
        explanation: `The correct answer is "${sentenceKeyword.word}".`
      });
    }
  });

  return shuffleArray(questions).slice(0, questionCount);
}

function determineDifficulty(score) {
  if (score > 0.05) return 'easy';
  if (score > 0.02) return 'medium';
  return 'hard';
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// POST /api/quiz/generate - Generate quiz from uploads
router.post('/generate', async (req, res) => {
  try {
    const { fileIds, questionCount = 10, difficulty = 'all' } = req.body;

    console.log('🎯 Quiz generation requested:', { fileIds, questionCount, difficulty });

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one document ID'
      });
    }

    // Fetch documents
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

    console.log('📚 Found documents:', uploads.length);

    // Generate questions from each document
    let allQuestions = [];
    uploads.forEach(upload => {
      const questions = generateQuestions(upload, Math.ceil(questionCount / uploads.length));
      allQuestions = [...allQuestions, ...questions];
    });

    // Filter by difficulty if specified
    if (difficulty !== 'all') {
      allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }

    // Limit to requested count
    const finalQuestions = allQuestions.slice(0, questionCount);

    // Save quiz to database
    const quiz = new Quiz({
      user: req.user._id,
      title: `Quiz from ${uploads.length} document(s)`,
      description: uploads.map(u => u.originalName).join(', '),
      documents: fileIds,
      questions: finalQuestions,
      settings: {
        timeLimit: questionCount * 2, // 2 minutes per question
        randomizeQuestions: true,
        randomizeOptions: true,
        showCorrectAnswers: true,
        allowRetake: true,
        passingScore: 70
      },
      metadata: {
        totalQuestions: finalQuestions.length,
        difficulty: difficulty,
        estimatedTime: questionCount * 2
      }
    });

    await quiz.save();
    console.log('✅ Quiz saved:', quiz._id);

    res.json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quizId: quiz._id,
        title: quiz.title,
        questions: quiz.questions,
        settings: quiz.settings,
        metadata: quiz.metadata
      }
    });

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
});

// GET /api/quiz/:id - Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('documents', 'originalName fileType');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('❌ Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
});

// POST /api/quiz/:id/submit - Submit quiz attempt
router.post('/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = quiz.questions.map(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'true-false') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'fill-in-blank') {
        isCorrect = question.acceptedAnswers.some(ans => 
          ans.toLowerCase() === userAnswer?.toLowerCase()
        );
      }

      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= (quiz.settings.passingScore || 70);

    // Save attempt
    const attempt = {
      attemptDate: new Date(),
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      passed,
      answers: results,
      timeSpent: req.body.timeSpent || 0
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    res.json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passed,
        results,
        attempt
      }
    });

  } catch (error) {
    console.error('❌ Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

// GET /api/quiz/user/all - Get all user quizzes
router.get('/user/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('documents', 'originalName');

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('❌ Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
});

export default router;
