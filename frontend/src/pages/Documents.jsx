import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Eye, Trash2, Clock, BookOpen, Lock, Globe, Award } from 'lucide-react'
import ApiService from '../services/api'
import toast from 'react-hot-toast'

export default function Documents() {
  const navigate = useNavigate()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await ApiService.getUserUploads()
      if (response.success) {
        setUploads(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await ApiService.deleteUpload(id)
      if (response.success) {
        setUploads(uploads.filter(doc => doc._id !== id))
        toast.success('Document deleted successfully')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Documents ({uploads.length})
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Click on any document to view summary and generate quiz
          </p>
        </div>

        {uploads.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents uploaded yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your first document to get started
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploads.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/summary/${doc._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  {doc.visibility === 'public' ? (
                    <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                  {doc.originalName}
                </h3>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  {doc.subject && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{doc.subject}</span>
                    </div>
                  )}
                  {doc.semester && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Semester {doc.semester}</span>
                    </div>
                  )}
                  {doc.metadata && (
                    <>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{doc.metadata.wordCount || 0} words</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{doc.metadata.readingTime || 0} min read</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/summary/${doc._id}`)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Summary</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(doc._id, e)}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
