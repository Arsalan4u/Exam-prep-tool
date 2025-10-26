import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Brain, Settings, Play, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import ApiService from '../services/api'
import toast from 'react-hot-toast'

export default function QuizGenerate() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [settings, setSettings] = useState({
    questionCount: 10,
    difficulty: 'medium',
    types: ['mcq'],
    timeLimit: 20
  })

  const fileIds = searchParams.get('files')?.split(',') || []

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await ApiService.getUserUploads()
      const selectedFiles = response.data.filter(file => 
        fileIds.includes(file._id)
      )
      setFiles(selectedFiles)
    } catch (error) {
      toast.error('Failed to fetch files')
      navigate('/upload')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await ApiService.generateQuiz(fileIds, settings)
      toast.success('Quiz generated successfully!')
      navigate(`/quiz/${response.data.quizId}`)
    } catch (error) {
      toast.error('Failed to generate quiz: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleQuestionType = (type) => {
    setSettings(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/upload')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Generate Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a personalized quiz from your study materials
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Settings */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quiz Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={settings.questionCount}
                    onChange={(e) => updateSettings('questionCount', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateSettings('difficulty', level)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          settings.difficulty === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Types
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'mcq', label: 'Multiple Choice' },
                      { key: 'fill-in-blank', label: 'Fill in the Blank' },
                      { key: 'true-false', label: 'True/False' }
                    ].map((type) => (
                      <label key={type.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.types.includes(type.key)}
                          onChange={() => toggleQuestionType(type.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.timeLimit}
                    onChange={(e) => updateSettings('timeLimit', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  loading={generating}
                  disabled={settings.types.length === 0}
                  className="w-full"
                  size="lg"
                  icon={<Play className="h-5 w-5" />}
                >
                  Generate Quiz
                </Button>

                {/* Estimated Time */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Estimated completion time: {settings.questionCount * 1.5} minutes
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Source Files */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Source Materials ({files.length} files)
              </h2>
              
              <div className="space-y-4">
                {files.map((file) => (
                  <SourceFileCard key={file._id} file={file} />
                ))}
              </div>

              {files.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No files selected for quiz generation
                  </p>
                  <Button
                    onClick={() => navigate('/upload')}
                    variant="outline"
                    className="mt-4"
                  >
                    Select Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SourceFileCard({ file }) {
  const getFileTypeColor = (type) => {
    const colors = {
      notes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      pyq: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      syllabus: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return colors[type] || colors.other
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {file.originalName}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file.fileType)}`}>
            {file.fileType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{file.metadata?.wordCount || 0} words</span>
          <span>{file.metadata?.readingTime || 0} min read</span>
          <span className="capitalize">{file.metadata?.difficulty || 'medium'} difficulty</span>
        </div>
      </div>
      
      {file.topics && file.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {file.topics.slice(0, 3).map((topic, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded"
            >
              {topic.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
