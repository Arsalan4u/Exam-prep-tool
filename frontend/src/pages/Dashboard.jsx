import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, FileText, Brain, TrendingUp, Plus, ArrowRight, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ApiService from '../services/api'
import Button from '../components/ui/Button'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalWords: 0,
    avgReadingTime: 0,
    recentUploads: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await ApiService.getUserUploads()
      if (response.success) {
        const uploads = response.data
        
        const totalWords = uploads.reduce((sum, upload) => 
          sum + (upload.metadata?.wordCount || 0), 0)
        
        const avgReadingTime = uploads.length > 0 
          ? Math.round(uploads.reduce((sum, upload) => 
              sum + (upload.metadata?.readingTime || 0), 0) / uploads.length)
          : 0

        setStats({
          totalUploads: uploads.length,
          totalWords,
          avgReadingTime,
          recentUploads: uploads.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your study progress overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Documents"
            value={stats.totalUploads}
            icon={<FileText className="h-8 w-8" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Words Processed"
            value={stats.totalWords.toLocaleString()}
            icon={<Brain className="h-8 w-8" />}
            color="bg-green-500"
          />
          <StatCard
            title="Avg Reading Time"
            value={`${stats.avgReadingTime} min`}
            icon={<TrendingUp className="h-8 w-8" />}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Upload New Document"
            description="Add your study materials and get AI-powered summaries"
            icon={<Upload className="h-12 w-12" />}
            linkTo="/upload"
            buttonText="Upload Files"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <QuickActionCard
            title="View All Documents"
            description="Browse and manage your uploaded study materials"
            icon={<FileText className="h-12 w-12" />}
            linkTo="/documents"
            buttonText="View Documents"
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <QuickActionCard
            title="Quiz History"
            description="View your past quiz scores and track progress"
            icon={<BarChart3 className="h-12 w-12" />}
            linkTo="/quiz-history"
            buttonText="View History"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
        </div>

        {/* Recent Documents */}
        {stats.recentUploads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Documents
              </h2>
              <Link
                to="/documents"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentUploads.map((upload) => (
                <div
                  key={upload._id}
                  onClick={() => navigate(`/summary/${upload._id}`)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {upload.originalName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {upload.metadata?.wordCount || 0} words • {upload.metadata?.readingTime || 0} min read
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalUploads === 0 && (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your first document to get started with AI-powered summaries
            </p>
            <Link to="/upload">
              <Button icon={<Plus className="h-5 w-5" />}>
                Upload Your First Document
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`${color} text-white p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, icon, linkTo, buttonText, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className={`${color} text-white p-4 rounded-xl w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <Link to={linkTo}>
        <Button variant="outline" className="w-full">
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
