import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Loader2, Lock, Globe, CheckCircle } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  
  const [formData, setFormData] = useState({
    file: null,
    fileType: 'notes',
    subject: '',
    semester: '',
    visibility: 'private',
    description: ''
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Engineering', 'History', 'Geography',
    'Economics', 'Literature', 'Business', 'Medicine', 'Law', 'Other'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const fileTypes = [
    { value: 'notes', label: 'Study Notes' },
    { value: 'lecture', label: 'Lecture Material' },
    { value: 'textbook', label: 'Textbook Chapter' },
    { value: 'article', label: 'Research Article' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        alert('Please upload only PDF or TXT files');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    if (!formData.subject) {
      alert('Please select a subject');
      return;
    }

    if (!formData.semester) {
      alert('Please select a semester');
      return;
    }

    setLoading(true);
    setUploadSuccess(false);

    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('fileType', formData.fileType);
      data.append('subject', formData.subject);
      data.append('semester', formData.semester);
      data.append('visibility', formData.visibility);
      data.append('description', formData.description);

      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadSuccess(true);
        setUploadedData(result.data);
        
        // Show success message
        setTimeout(() => {
          // Navigate to summary page
          navigate(`/summary/${result.data._id}`);
        }, 2000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (uploadSuccess && uploadedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Upload Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your file has been processed successfully
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <strong>File:</strong> {uploadedData.originalName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <strong>Subject:</strong> {uploadedData.subject}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <strong>Semester:</strong> {uploadedData.semester}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Visibility:</strong> {uploadedData.visibility}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to summary page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <UploadIcon className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Upload Document</h1>
            </div>
            <p className="text-blue-100">
              Upload your study materials and get AI-powered summaries & quizzes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select File (PDF or TXT) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {formData.file && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <FileText className="w-4 h-4 mr-2" />
                    {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum file size: 10MB
              </p>
            </div>

            {/* File Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Visibility
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  <input
                    type="radio"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">Private</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Only visible to you</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  <input
                    type="radio"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">Public</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Visible to everyone</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Brief description of the document (optional)..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload & Generate Summary + Quiz</span>
                </>
              )}
            </button>

            {loading && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>⚙️ Extracting text from document...</p>
                <p>🤖 Generating AI-powered summary...</p>
                <p>📝 Creating quiz questions...</p>
                <p className="mt-2 text-xs">This may take 10-30 seconds</p>
              </div>
            )}
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">📚 AI Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get structured summaries with key concepts and takeaways
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">🎯 Quiz Generation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Auto-generated quizzes to test your understanding
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">🔍 Search Library</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access public documents shared by other students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
