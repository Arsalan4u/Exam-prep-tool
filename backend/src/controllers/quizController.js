import Upload from '../models/Upload.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import TFIDF from '../utils/tfidf.js';
import natural from 'natural';

export const generateQuiz = async (req, res) => {
  try {
    const { fileIds, questionCount = 10, difficulty = 'medium', types = ['mcq'] } = req.body;

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

    // Combine text and generate questions
    const combinedText = uploads.map(u => u.extractedText).join('\n\n');
    const questions = await generateQuestionsFromText(combinedText, questionCount, difficulty, types);

    // Create quiz
    const quiz = new Quiz({
      user: req.user._id,
      title: `Quiz from ${uploads.length} document(s)`,
      description: `Generated from: ${uploads.map(u => u.originalName).join(', ')}`,
      sourceFiles: fileIds,
      questions,
      settings: {
        timeLimit: questionCount * 2, // 2 minutes per question
        randomizeQuestions: true,
        showCorrectAnswers: true,
        allowRetake: true
      }
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quizId: quiz._id,
        title: quiz.title,
        questionCount: questions.length,
        estimatedTime: quiz.settings.timeLimit,
        difficulty,
        types
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
};

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      user: req.user._id
    }).populate('sourceFiles', 'originalName fileType');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Remove correct answers from questions for quiz attempt
    const questionsForAttempt = quiz.questions.map(q => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
      topic: q.topic,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions: questionsForAttempt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz',
      error: error.message
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, startTime, endTime } = req.body;

    const quiz = await Quiz.findOne({
      _id: id,
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
    const detailedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      if (question.type === 'mcq') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.text === userAnswer;
      } else if (question.type === 'fill-in-blank' || question.type === 'true-false') {
        isCorrect = question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
      }

      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        questionId: question._id,
        userAnswer,
        correctAnswer: question.type === 'mcq' 
          ? question.options.find(opt => opt.isCorrect)?.text 
          : question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const percentage = score;

    // Create attempt record
    const attempt = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      score: correctAnswers,
      percentage,
      answers: detailedAnswers,
      completedAt: new Date()
    };

    quiz.attempts.push(attempt);
    quiz.updateStats(attempt);
    await quiz.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    const topics = quiz.questions.map(q => q.topic).filter(t => t);
    user.updateStats({ score: percentage, topics });
    await user.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: correctAnswers,
        total: quiz.questions.length,
        percentage,
        answers: detailedAnswers,
        timeTaken: Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60), // minutes
        passed: percentage >= 60
      }
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

export const getUserQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const quizzes = await Quiz.find({ user: req.user._id })
      .populate('sourceFiles', 'originalName fileType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-questions.correctAnswer -questions.explanation'); // Hide answers

    const total = await Quiz.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: quizzes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quizzes',
      error: error.message
    });
  }
};

// Helper function to generate questions from text
async function generateQuestionsFromText(text, count, difficulty, types) {
  const questions = [];
  const sentences = natural.SentenceTokenizer.tokenize(text);
  const tfidf = new TFIDF();
  tfidf.addDocument(text);
  
  const keywords = tfidf.getTopKeywords(text, count * 3);
  const topics = tfidf.extractTopics(text);

  // Generate different types of questions
  for (let i = 0; i < count; i++) {
    const questionType = types[Math.floor(Math.random() * types.length)];
    const keyword = keywords[i % keywords.length];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    if (questionType === 'mcq') {
      questions.push(generateMCQ(sentences, keyword, topic, difficulty));
    } else if (questionType === 'fill-in-blank') {
      questions.push(generateFillInBlank(sentences, keyword, topic, difficulty));
    } else if (questionType === 'true-false') {
      questions.push(generateTrueFalse(sentences, keyword, topic, difficulty));
    }
  }

  return questions.filter(q => q !== null);
}

function generateMCQ(sentences, keyword, topic, difficulty) {
  // Find sentences containing the keyword
  const relevantSentences = sentences.filter(s => 
    s.toLowerCase().includes(keyword.word.toLowerCase())
  );

  if (relevantSentences.length === 0) return null;

  const sentence = relevantSentences[Math.floor(Math.random() * relevantSentences.length)];
  
  // Create question by replacing keyword with blank
  const question = `What does the following statement relate to: "${sentence.replace(new RegExp(keyword.word, 'gi'), '___')}"?`;
  
  const options = [
    { text: keyword.word, isCorrect: true },
    { text: generateDistractor(keyword.word), isCorrect: false },
    { text: generateDistractor(keyword.word), isCorrect: false },
    { text: generateDistractor(keyword.word), isCorrect: false }
  ];

  // Shuffle options
  shuffleArray(options);

  return {
    question,
    type: 'mcq',
    options,
    difficulty,
    topic: topic?.name || 'General',
    keywords: [keyword.word],
    explanation: `The correct answer is "${keyword.word}" as it appears in the context of the given statement.`
  };
}

function generateFillInBlank(sentences, keyword, topic, difficulty) {
  const relevantSentences = sentences.filter(s => 
    s.toLowerCase().includes(keyword.word.toLowerCase())
  );

  if (relevantSentences.length === 0) return null;

  const sentence = relevantSentences[Math.floor(Math.random() * relevantSentences.length)];
  const question = sentence.replace(new RegExp(keyword.word, 'gi'), '____');

  return {
    question: `Fill in the blank: ${question}`,
    type: 'fill-in-blank',
    correctAnswer: keyword.word,
    difficulty,
    topic: topic?.name || 'General',
    keywords: [keyword.word],
    explanation: `The missing word is "${keyword.word}" based on the context.`
  };
}

function generateTrueFalse(sentences, keyword, topic, difficulty) {
  const relevantSentences = sentences.filter(s => 
    s.toLowerCase().includes(keyword.word.toLowerCase())
  );

  if (relevantSentences.length === 0) return null;

  const sentence = relevantSentences[Math.floor(Math.random() * relevantSentences.length)];
  const isTrue = Math.random() > 0.5;
  
  const question = isTrue 
    ? sentence 
    : sentence.replace(keyword.word, generateDistractor(keyword.word));

  return {
    question: `True or False: ${question}`,
    type: 'true-false',
    correctAnswer: isTrue ? 'True' : 'False',
    difficulty,
    topic: topic?.name || 'General',
    keywords: [keyword.word],
    explanation: `The statement is ${isTrue ? 'true' : 'false'} based on the source material.`
  };
}

function generateDistractor(word) {
  const distractors = {
    'science': ['biology', 'chemistry', 'physics', 'mathematics'],
    'biology': ['chemistry', 'physics', 'science', 'anatomy'],
    'chemistry': ['biology', 'physics', 'science', 'biochemistry'],
    'history': ['geography', 'politics', 'culture', 'society'],
    'mathematics': ['algebra', 'geometry', 'calculus', 'statistics']
  };
  
  const category = Object.keys(distractors).find(key => 
    word.toLowerCase().includes(key) || key.includes(word.toLowerCase())
  );
  
  if (category && distractors[category]) {
    return distractors[category][Math.floor(Math.random() * distractors[category].length)];
  }
  
  // Generic distractors
  const generic = ['concept', 'theory', 'principle', 'method', 'process', 'system'];
  return generic[Math.floor(Math.random() * generic.length)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

