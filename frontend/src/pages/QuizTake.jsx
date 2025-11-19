import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import ApiService from '../services/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!showResults && quiz) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, quiz]);

  const fetchQuiz = async () => {
    try {
      const response = await ApiService.getQuiz(id);
      if (response.success) {
        setQuiz(response.data);
      } else {
        toast.error('Failed to load quiz');
        navigate('/upload');
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const toggleFlag = (index) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(index)) {
      newFlagged.delete(index);
    } else {
      newFlagged.add(index);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    try {
      const response = await ApiService.submitQuiz(id, answers, timeSpent);
      if (response.success) {
        setResults(response.data);
        setShowResults(true);
        toast.success(`Quiz completed! Score: ${response.data.score.toFixed(1)}%`);
      } else {
        toast.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showResults) {
    return <QuizResults results={results} quiz={quiz} onRetake={() => {
      setAnswers({});
      setCurrentQuestion(0);
      setTimeSpent(0);
      setShowResults(false);
      setResults(null);
    }} />;
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quiz.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {question.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {question.topic}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {question.question}
              </h2>
            </div>
            <button
              onClick={() => toggleFlag(currentQuestion)}
              className={`p-2 rounded-lg transition-colors ${
                flaggedQuestions.has(currentQuestion)
                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Flag className="h-5 w-5" />
            </button>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.type === 'mcq' && question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option.text)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  answers[question.id] === option.text
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[question.id] === option.text
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {answers[question.id] === option.text && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">{option.text}</span>
                </div>
              </button>
            ))}

            {question.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      answers[question.id] === option
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'fill-in-blank' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            icon={<ArrowLeft className="h-5 w-5" />}
          >
            Previous
          </Button>

          {/* Question Dots */}
          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 w-8'
                    : answers[quiz.questions[index].id]
                    ? 'bg-green-500'
                    : flaggedQuestions.has(index)
                    ? 'bg-yellow-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              variant="success"
              onClick={handleSubmit}
              icon={<CheckCircle className="h-5 w-5" />}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              icon={<ArrowRight className="h-5 w-5" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizResults({ results, quiz, onRetake }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            results.passed 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {results.passed ? (
              <CheckCircle className="h-12 w-12" />
            ) : (
              <XCircle className="h-12 w-12" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {results.score.toFixed(1)}%
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {results.correctAnswers} out of {results.totalQuestions} correct
          </p>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/upload')}>
              Back to Documents
            </Button>
            {quiz.settings.allowRetake && (
              <Button variant="primary" onClick={onRetake}>
                Retake Quiz
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Question Review
          </h3>

          {results.results.map((result, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow border-2 p-6 ${
                result.isCorrect
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  result.isCorrect 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                }`}>
                  {result.isCorrect ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    Question {index + 1}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {quiz.questions[index].question}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                      <span className={result.isCorrect ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {result.userAnswer || 'No answer'}
                      </span>
                    </div>

                    {!result.isCorrect && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Correct answer: </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {result.correctAnswer}
                        </span>
                      </div>
                    )}

                    {result.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          <span className="font-medium">Explanation: </span>
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
