import React, { useState } from 'react'
import { Upload, Download, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function TestComponents() {
  const [activeTab, setActiveTab] = useState('buttons')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Tailwind CSS Test Components
      </h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['buttons', 'cards', 'forms', 'modals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'buttons' && <ButtonTests />}
        {activeTab === 'cards' && <CardTests />}
        {activeTab === 'forms' && <FormTests />}
        {activeTab === 'modals' && <ModalTests />}
      </div>
    </div>
  )
}

function ButtonTests() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Button Tests</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Primary Buttons</h3>
          <button className="btn-primary w-full">
            Primary Button
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full transition-colors">
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full transition-colors">
            <CheckCircle className="h-4 w-4" />
            <span>Success</span>
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Secondary Buttons</h3>
          <button className="btn-secondary w-full">
            Secondary Button
          </button>
          <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 w-full transition-colors">
            Outline Button
          </button>
          <button className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full transition-colors">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Icon Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Icon Buttons</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors">
            <Upload className="h-5 w-5" />
          </button>
          <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Eye className="h-5 w-5" />
          </button>
          <button className="bg-red-100 dark:bg-red-900/20 text-red-600 p-3 rounded-full hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CardTests() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Card Tests</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Basic Card
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This is a basic card component with shadow and rounded corners.
          </p>
          <button className="btn-primary">
            Action
          </button>
        </div>

        {/* Stats Card */}
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Average Score
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last 10 quizzes
          </p>
        </div>

        {/* Progress Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Progress
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Mathematics</span>
                <span className="text-gray-900 dark:text-white">75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Physics</span>
                <span className="text-gray-900 dark:text-white">60%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormTests() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    file: null
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Form Tests</h2>
      
      <div className="max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Upload
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Drag and drop your files here or click to browse
              </p>
              <input type="file" className="hidden" />
            </div>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary">
              Submit
            </button>
            <button type="button" className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalTests() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Modal Tests</h2>
      
      <button 
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        Open Modal
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Modal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This is a test modal to check if the styling works correctly.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowModal(false)}
                className="btn-primary"
              >
                Close
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
