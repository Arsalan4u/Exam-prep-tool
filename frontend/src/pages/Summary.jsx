import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Brain, Hash, Lightbulb, Copy, Download, BookOpen } from 'lucide-react'
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
      const response = await ApiService.getSummary(id)
      
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
      element.download = `${summary.originalName || 'document'}_summary.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success('Summary downloaded!')
    }
  }

  // IMPROVED FORMATTING - Fixes square character issue
  const formatSummary = (text) => {
    if (!text) return { formatted: '', isStructured: false };
    
    // Clean up any encoding issues - replace squares with proper bullets
    let cleanedText = text
      .replace(/□/g, '•')
      .replace(/\u25a1/g, '•')
      .replace(/\u2022/g, '•')
      .replace(/\*/g, '•');
    
    // Check if already structured (has emoji headers)
    const isStructured = cleanedText.includes('📚') || cleanedText.includes('🔑') || cleanedText.includes('💡');
    
    if (isStructured) {
      // Format structured summary
      const lines = cleanedText.split('\n');
      const formatted = lines.map(line => {
        const trimmed = line.trim();
        
        // Headers with emojis
        if (trimmed.includes('📚 TOPIC OVERVIEW') || trimmed.includes('📚 Topic Overview')) {
          return '<h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-6 mb-4 flex items-center gap-2"><span>📚</span><span>Topic Overview</span></h3>';
        }
        if (trimmed.includes('🔑 KEY CONCEPTS') || trimmed.includes('🔑 Key Concepts')) {
          return '<h3 class="text-xl font-bold text-green-600 dark:text-green-400 mt-6 mb-4 flex items-center gap-2"><span>🔑</span><span>Key Concepts</span></h3>';
        }
        if (trimmed.includes('💡 IMPORTANT POINTS') || trimmed.includes('💡 Important Points')) {
          return '<h3 class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-6 mb-4 flex items-center gap-2"><span>💡</span><span>Important Points</span></h3>';
        }
        if (trimmed.includes('📝 EXAMPLES') || trimmed.includes('📝 Examples')) {
          return '<h3 class="text-xl font-bold text-orange-600 dark:text-orange-400 mt-6 mb-4 flex items-center gap-2"><span>📝</span><span>Examples & Applications</span></h3>';
        }
        if (trimmed.includes('✅ KEY TAKEAWAYS') || trimmed.includes('✅ Key Takeaways')) {
          return '<h3 class="text-xl font-bold text-red-600 dark:text-red-400 mt-6 mb-4 flex items-center gap-2"><span>✅</span><span>Key Takeaways</span></h3>';
        }
        
        // Bullet points - properly format with actual disc bullets
        if (trimmed.startsWith('•')) {
          const content = trimmed.substring(1).trim();
          return `<li class="text-gray-700 dark:text-gray-300 leading-relaxed mb-2" style="list-style-type: disc; display: list-item;">${content}</li>`;
        }
        
        // Regular paragraphs
        if (trimmed && !trimmed.includes('<h3') && !trimmed.includes('<li')) {
          return `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">${trimmed}</p>`;
        }
        
        return '';
      }).filter(line => line).join('\n');
      
      // Wrap consecutive list items in ul tags
      const withLists = formatted.replace(/(<li.*?<\/li>\n?)+/g, match => {
        return `<ul class="space-y-2 my-4 ml-8 list-disc">${match}</ul>`;
      });
      
      return {
        formatted: withLists,
        isStructured: true
      };
    } else {
      // Auto-format unstructured text into readable paragraphs
      const sentences = cleanedText.split(/(?<=[.!?])\s+/);
      const paragraphs = [];
      
      for (let i = 0; i < sentences.length; i += 3) {
        const chunk = sentences.slice(i, i + 3).join(' ');
        paragraphs.push(`<p class="text-gray-700 dark:text-gray-300 leading-loose mb-6 text-justify">${chunk}</p>`);
      }
      
      return {
        formatted: paragraphs.join('\n'),
        isStructured: false
      };
    }
  };

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

  const { formatted, isStructured } = formatSummary(summary?.summary);

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Uploads</span>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary?.originalName || 'Document Summary'}
            </h1>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {summary?.metadata?.wordCount?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Words</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {summary?.metadata?.readingTime || 0}<span className="text-lg ml-1">min</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Reading Time</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {summary?.metadata?.compressionRatio || 0}<span className="text-lg">%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Compression</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 capitalize">
                {summary?.metadata?.difficulty || 'Medium'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Difficulty</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI-Generated Summary
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isStructured ? 'Structured format with key sections' : 'Comprehensive overview'}
              </p>
            </div>
            {summary?.metadata?.aiProcessed && (
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                ✨ Gemini AI
              </span>
            )}
          </div>
          
          <div 
            className="prose prose-lg dark:prose-invert max-w-none summary-content"
            style={{ fontSize: '1.05rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        </div>

        {/* Topics & Keywords */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Topics */}
          {summary?.topics && summary.topics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Key Topics
                </h3>
              </div>
              
              <div className="space-y-4">
                {summary.topics.slice(0, 8).map((topic, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-800 dark:text-gray-200 font-semibold">
                        {topic.name}
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {Math.round(topic.importance * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 group-hover:from-yellow-500 group-hover:to-orange-600"
                        style={{ width: `${Math.min(topic.importance * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {summary?.keywords && summary.keywords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Hash className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Important Keywords
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {summary.keywords.slice(0, 15).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-gray-800 dark:text-gray-200 text-sm rounded-lg font-medium border border-green-200 dark:border-green-800 hover:shadow-md transition-all cursor-default hover:scale-105"
                  >
                    {keyword.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add CSS for proper bullet rendering */}
        <style jsx>{`
          .summary-content ul {
            list-style-type: disc !important;
            padding-left: 2rem !important;
          }
          .summary-content li {
            display: list-item !important;
            list-style-type: disc !important;
            margin-left: 1rem;
          }
          .summary-content li::marker {
            color: #3b82f6;
            font-size: 1.2em;
          }
        `}</style>
      </div>
    </div>
  )
}
