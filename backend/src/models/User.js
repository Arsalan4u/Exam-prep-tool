import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    weakTopics: [String],
    strongTopics: [String]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update user stats
userSchema.methods.updateStats = function(quizResult) {
  this.stats.totalQuizzes += 1;
  
  // Calculate new average score
  const currentTotal = this.stats.averageScore * (this.stats.totalQuizzes - 1);
  this.stats.averageScore = (currentTotal + quizResult.score) / this.stats.totalQuizzes;
  
  // Update weak/strong topics based on performance
  if (quizResult.score < 60) {
    this.stats.weakTopics.push(...quizResult.topics);
  } else if (quizResult.score > 80) {
    this.stats.strongTopics.push(...quizResult.topics);
  }
  
  // Remove duplicates
  this.stats.weakTopics = [...new Set(this.stats.weakTopics)];
  this.stats.strongTopics = [...new Set(this.stats.strongTopics)];
};

export default mongoose.model('User', userSchema);
