import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag } from 'lucide-react'
import Button from '../components/ui/Button'
import ApiService from '../services/api'
import toast from 'react-hot-toast'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState(null)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    fetchQuiz()
  }, [id])

  useEffect(() => {
    let interval = null
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, timeLeft, quizCompleted])

  const fetchQuiz = async () => {
    try {
      const response = await ApiService.getQuiz(id)
      setQuiz(response.data)
      setTimeLeft(response.data.settings.timeLimit * 60) // Convert to seconds
    } catch (error) {
      toast.error('Failed to load quiz')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setStartTime(new Date())
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleSubmitQuiz = async () => {
    if (!startTime) return

    const endTime = new Date()
    const answersArray = quiz.questions.map((_, index) => answers[index] || '')

    try {
      const response = await ApiService.submitQuiz(id, answersArray, startTime, endTime)
      setResults(response.data)
      setQuizCompleted(true)
      toast.success(`Quiz completed! Score: ${response.data.percentage}%`)
    } catch (error) {
      toast.error('Failed to submit quiz')
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / quiz.questions.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Not Found
          </h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Quiz Results Screen
  if (quizCompleted && results) {
    return <QuizResults results={results} quiz={quiz} onBackToDashboard={() => navigate('/dashboard')} />
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {quiz.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {quiz.description}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Questions
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {quiz.settings.timeLimit}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Minutes
                </div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  Mixed
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Question Types
                </div>
              </div>
            </div>

            <div className="text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Instructions:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Read each question carefully</li>
                <li>• You can navigate between questions using the navigation buttons</li>
                <li>• Your progress is automatically saved</li>
                <li>• Submit your quiz before time runs out</li>
              </ul>
            </div>

            <Button
              onClick={startQuiz}
              size="lg"
              className="w-full sm:w-auto"
              icon={<Clock className="h-5 w-5" />}
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Taking Screen
  const question = quiz.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {quiz.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 300 ? 'text-red-600' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question {currentQuestion + 1}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    question.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : question.difficulty === 'hard'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {question.question}
                </h2>
              </div>

              <QuestionContent
                question={question}
                answer={answers[currentQuestion] || ''}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion, answer)}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Question Navigator
              </h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[index]
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Answered:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Object.keys(answers).length}/{quiz.questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmitQuiz}
                variant="success"
                className="w-full mt-6"
                disabled={Object.keys(answers).length === 0}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          
          <Button
            onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === quiz.questions.length - 1}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function QuestionContent({ question, answer, onAnswerChange }) {
  if (question.type === 'mcq') {
    return (
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              answer === option.text
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <input
              type="radio"
              name="answer"
              value={option.text}
              checked={answer === option.text}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-900 dark:text-white">
              {option.text}
            </span>
          </label>
        ))}
      </div>
    )
  }

  if (question.type === 'fill-in-blank') {
    return (
      <input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        className="input-field text-lg"
      />
    )
  }

  if (question.type === 'true-false') {
    return (
      <div className="space-y-3">
        {['True', 'False'].map((option) => (
          <label
            key={option}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              answer === option
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <input
              type="radio"
              name="answer"
              value={option}
              checked={answer === option}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-900 dark:text-white text-lg">
              {option}
            </span>
          </label>
        ))}
      </div>
    )
  }

  return null
}

function QuizResults({ results, quiz, onBackToDashboard }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card text-center">
          <div className="mb-8">
            {results.passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {results.passed ? 'Congratulations! You passed the quiz.' : 'Keep studying and try again!'}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {results.percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Final Score
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {results.score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Correct Answers
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {results.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Questions
              </div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {results.timeTaken}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Minutes
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={onBackToDashboard} size="lg">
              Back to Dashboard
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Your progress has been saved and will be reflected in your dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
