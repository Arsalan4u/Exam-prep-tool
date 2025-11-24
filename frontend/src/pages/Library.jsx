import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Eye, 
  Download, 
  Clock, 
  FileText,
  TrendingUp,
  Award,
  Globe,
  X
} from 'lucide-react'
import ApiService from '../services/api'
import toast from 'react-hot-toast'

export default function Library() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [filteredDocs, setFilteredDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const subjects = [
    'All Subjects',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'History',
    'Geography',
    'Economics',
    'Literature',
    'Business',
    'Medicine',
    'Law',
    'Other'
  ]

  const semesters = ['All Semesters', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

  useEffect(() => {
    fetchPublicDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [searchQuery, selectedSubject, selectedSemester, documents])

  const fetchPublicDocuments = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getPublicUploads()
      
      if (response.success) {
        setDocuments(response.data || [])
        setFilteredDocs(response.data || [])
      } else {
        toast.error('Failed to load library')
      }
    } catch (error) {
      console.error('Failed to fetch library:', error)
      toast.error('Failed to load public documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(doc => doc.subject === selectedSubject)
    }

    // Semester filter
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(doc => doc.semester === selectedSemester)
    }

    setFilteredDocs(filtered)
  }

  const handleViewDocument = (id) => {
    navigate(`/summary/${id}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject('all')
    setSelectedSemester('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading library...</p>
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
            <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Public Library
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and learn from documents shared by the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{documents.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subjects Available</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {new Set(documents.map(d => d.subject).filter(Boolean)).size}
                </p>
              </div>
              <Award className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Words</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {documents.reduce((sum, doc) => sum + (doc.metadata?.wordCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents, subjects, topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.slice(1).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Semesters</option>
                    {semesters.slice(1).map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedSubject !== 'all' || selectedSemester !== 'all') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedSubject !== 'all' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                {selectedSubject}
              </span>
            )}
            {selectedSemester !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                Semester {selectedSemester}
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold">{filteredDocs.length}</span> of <span className="font-bold">{documents.length}</span> documents
          </p>
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedSubject !== 'all' || selectedSemester !== 'all'
                ? 'Try adjusting your filters'
                : 'No public documents available yet'}
            </p>
            {(searchQuery || selectedSubject !== 'all' || selectedSemester !== 'all') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleViewDocument(doc._id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <span className="flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
                  {doc.originalName}
                </h3>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  {doc.subject && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{doc.subject}</span>
                    </div>
                  )}
                  {doc.semester && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Semester {doc.semester}</span>
                    </div>
                  )}
                  {doc.metadata && (
                    <>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{(doc.metadata.wordCount || 0).toLocaleString()} words</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{doc.metadata.readingTime || 0} min read</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                {doc.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDocument(doc._id)
                    }}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
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
