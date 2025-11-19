import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  }],
  questions: [{
    id: String,
    type: {
      type: String,
      enum: ['mcq', 'true-false', 'fill-in-blank'],
      required: true
    },
    question: String,
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    acceptedAnswers: [String],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    topic: String,
    explanation: String
  }],
  settings: {
    timeLimit: Number,
    randomizeQuestions: Boolean,
    randomizeOptions: Boolean,
    showCorrectAnswers: Boolean,
    allowRetake: Boolean,
    passingScore: Number
  },
  attempts: [{
    attemptDate: Date,
    score: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    passed: Boolean,
    timeSpent: Number,
    answers: [mongoose.Schema.Types.Mixed]
  }],
  metadata: {
    totalQuestions: Number,
    difficulty: String,
    estimatedTime: Number
  }
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);
