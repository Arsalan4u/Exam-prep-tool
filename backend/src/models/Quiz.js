import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'fill-in-blank', 'true-false'],
    default: 'mcq'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: String,
  keywords: [String]
});

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
  sourceFiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  }],
  questions: [questionSchema],
  settings: {
    timeLimit: Number,
    randomizeQuestions: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    allowRetake: { type: Boolean, default: true }
  },
  attempts: [{
    startTime: Date,
    endTime: Date,
    score: Number,
    percentage: Number,
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      userAnswer: String,
      isCorrect: Boolean,
      timeTaken: Number
    }],
    completedAt: Date
  }],
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Calculate quiz statistics
quizSchema.methods.updateStats = function(attempt) {
  this.stats.totalAttempts += 1;
  this.stats.bestScore = Math.max(this.stats.bestScore, attempt.score);
  
  // Calculate average score
  const totalScore = this.stats.averageScore * (this.stats.totalAttempts - 1) + attempt.score;
  this.stats.averageScore = totalScore / this.stats.totalAttempts;
  
  // Calculate average time
  const attemptTime = (attempt.endTime - attempt.startTime) / 1000 / 60; // minutes
  const totalTime = this.stats.averageTime * (this.stats.totalAttempts - 1) + attemptTime;
  this.stats.averageTime = totalTime / this.stats.totalAttempts;
};

export default mongoose.model('Quiz', quizSchema);
