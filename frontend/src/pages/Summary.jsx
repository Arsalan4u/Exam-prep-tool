import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, FileText, Brain, Hash, Lightbulb, Copy, Download } from 'lucide-react'
import ApiService from '../services/api'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'

export default function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchSummary()
    } else {
      setError('Invalid document ID')
      setLoading(false)
    }
  }, [id])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      console.log('Fetching summary for ID:', id)
      
      const response = await ApiService.getSummary(id)
      console.log('Summary response:', response)
      
      if (response.success) {
        setSummary(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch summary')
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
      setError(error.message)
      toast.error('Failed to load summary')
    } finally {
      setLoading(false)
    }
  }

  const copySummary = () => {
    if (summary?.summary) {
      navigator.clipboard.writeText(summary.summary)
      toast.success('Summary copied to clipboard!')
    }
  }

  const downloadSummary = () => {
    if (summary?.summary) {
      const element = document.createElement('a')
      const file = new Blob([summary.summary], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${summary.documentTitle || 'document'}_summary.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success('Summary downloaded!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading summary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button onClick={() => navigate('/upload')} variant="primary">
            Go Back to Uploads
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Uploads
          </button>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={copySummary}
              variant="outline"
              size="sm"
              icon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>
            <Button
              onClick={downloadSummary}
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Document Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {summary?.documentTitle || 'Document Summary'}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary?.wordCount || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary?.readingTime || 0}m
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Reading Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary?.compressionRatio || 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Compression</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summary?.summaryLength || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Sentences</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI-Generated Summary
            </h2>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {summary?.summary || 'No summary available'}
            </p>
          </div>
        </div>

        {/* Topics & Keywords */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Topics */}
          {summary?.topics && summary.topics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Key Topics
                </h3>
              </div>
              
              <div className="space-y-3">
                {summary.topics.slice(0, 6).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {topic.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.min(topic.importance * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                        {Math.round(topic.importance * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {summary?.keywords && summary.keywords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keywords
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {summary.keywords.slice(0, 12).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full font-medium"
                  >
                    {keyword.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
