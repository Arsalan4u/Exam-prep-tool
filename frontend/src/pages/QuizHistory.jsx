import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  BookOpen,
  Eye,
  BarChart3
} from 'lucide-react'
import ApiService from '../services/api'
import toast from 'react-hot-toast'

export default function QuizHistory() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalQuestions: 0,
    correctAnswers: 0
  })

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getUserQuizzes()
      
      if (response.success) {
        const quizzesData = response.data || []
        setQuizzes(quizzesData)
        calculateStats(quizzesData)
      }
    } catch (error) {
      console.error('Failed to fetch quiz history:', error)
      toast.error('Failed to load quiz history')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (quizzesData) => {
    const totalQuizzes = quizzesData.length
    
    let totalScore = 0
    let totalQuestions = 0
    let correctAnswers = 0

    quizzesData.forEach(quiz => {
      if (quiz.attempts && quiz.attempts.length > 0) {
        // Get the latest attempt
        const latestAttempt = quiz.attempts[quiz.attempts.length - 1]
        totalScore += latestAttempt.score || 0
        totalQuestions += latestAttempt.totalQuestions || 0
        correctAnswers += latestAttempt.correctAnswers || 0
      }
    })

    setStats({
      totalQuizzes,
      averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
      totalQuestions,
      correctAnswers
    })
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Quiz History
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your quiz performance and progress over time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalQuizzes}
                </p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Questions Answered</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalQuestions}
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.correctAnswers}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No quiz history yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start taking quizzes to see your progress here
            </p>
            <button
              onClick={() => navigate('/documents')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Browse Documents
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All Quizzes ({quizzes.length})
            </h2>
            
            {quizzes.map((quiz) => {
              const latestAttempt = quiz.attempts && quiz.attempts.length > 0 
                ? quiz.attempts[quiz.attempts.length - 1] 
                : null

              return (
                <div
                  key={quiz._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Quiz Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {quiz.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{quiz.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                        {latestAttempt && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{Math.round(latestAttempt.timeSpent / 60) || 0} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Target className="h-4 w-4" />
                          <span>{quiz.attempts?.length || 0} attempt(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    {latestAttempt && (
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(latestAttempt.score)}`}>
                            {latestAttempt.score?.toFixed(0) || 0}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {latestAttempt.correctAnswers}/{latestAttempt.totalQuestions} correct
                          </div>
                          {latestAttempt.passed ? (
                            <div className="flex items-center justify-center gap-1 mt-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">Passed</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 mt-2 text-red-600 dark:text-red-400">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">Failed</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/quiz/${quiz._id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Retake</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* All Attempts */}
                  {quiz.attempts && quiz.attempts.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Previous Attempts:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quiz.attempts.slice(0, -1).map((attempt, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBgColor(attempt.score)} ${getScoreColor(attempt.score)}`}
                          >
                            {attempt.score?.toFixed(0)}% - {new Date(attempt.attemptDate).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
