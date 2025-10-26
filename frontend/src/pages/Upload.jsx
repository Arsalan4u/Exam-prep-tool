import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import ApiService from "../services/api";
import toast from "react-hot-toast";
import { FileText, Clock, Eye, Trash2, Brain, BookOpen } from "lucide-react";
import Button from "../components/ui/Button";

export default function Upload() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      console.log('🔄 Fetching uploads...');
      const response = await ApiService.getUserUploads();
      console.log('📥 Uploads response:', response);
      
      if (response.success) {
        setUploads(response.data);
        console.log('✅ Uploads loaded:', response.data.length);
        
        // Debug: Log first upload to see structure
        if (response.data.length > 0) {
          console.log('🔍 First upload structure:', response.data[0]);
          console.log('🆔 First upload ID:', response.data[0]._id);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch uploads');
      }
    } catch (error) {
      console.error('❌ Failed to fetch uploads:', error);
      toast.error("Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newUpload) => {
    console.log('🎉 Upload successful, new upload data:', newUpload);
    console.log('🆔 New upload ID:', newUpload.id || newUpload._id);
    
    setUploads((prev) => [newUpload, ...prev]);
    toast.success("File uploaded and processed successfully!");
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Delete requested for ID:', id);
    
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await ApiService.deleteUpload(id);
      setUploads((prev) => prev.filter((upload) => upload._id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error('❌ Delete failed:', error);
      toast.error("Failed to delete file");
    }
  };

  const viewSummary = (id) => {
    console.log('👁️ View Summary clicked for ID:', id, 'Type:', typeof id);
    
    // More comprehensive ID validation
    if (!id || id === "undefined" || id === undefined || id === null || id === '') {
      console.error('❌ Invalid ID provided to viewSummary:', id);
      toast.error("Invalid document ID - cannot view summary");
      return;
    }

    // Convert to string if it's not already
    const idString = String(id);
    console.log('🔄 Navigating to summary with ID:', idString);
    
    // Navigate to summary page
    navigate(`/summary/${idString}`);
  };

  const generateQuiz = (ids) => {
    console.log('🧠 Generate Quiz clicked for IDs:', ids);
    
    const validIds = Array.isArray(ids) 
      ? ids.filter(id => id && id !== 'undefined' && id !== null) 
      : [ids].filter(id => id && id !== 'undefined' && id !== null);
      
    if (validIds.length === 0) {
      console.error('❌ No valid IDs for quiz generation:', ids);
      toast.error('No valid documents selected');
      return;
    }
    
    const queryParams = new URLSearchParams({ files: validIds.join(",") });
    navigate(`/quiz/generate?${queryParams}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <FileUpload onUpload={handleUploadSuccess} />

      {/* Uploaded Files Section */}
      {uploads.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Uploads ({uploads.length})
            </h3>

            {uploads.length > 1 && (
              <Button
                onClick={() => generateQuiz(uploads.map((u) => u._id || u.id))}
                variant="success"
                icon={<Brain className="h-4 w-4" />}
              >
                Generate Quiz from All Files
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {uploads.map((upload) => (
              <UploadCard
                key={upload._id || upload.id}
                upload={upload}
                onDelete={handleDelete}
                onViewSummary={viewSummary}
                onGenerateQuiz={(id) => generateQuiz([id])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploads.length === 0 && (
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents uploaded yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your first document to get started with AI-powered summaries
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadCard({ upload, onDelete, onViewSummary, onGenerateQuiz }) {
  // Debug logging for each card
  React.useEffect(() => {
    console.log('📋 UploadCard rendered for:', upload.originalName);
    console.log('🆔 Upload ID (_id):', upload._id);
    console.log('🆔 Upload ID (id):', upload.id);
    console.log('🔑 All upload keys:', Object.keys(upload));
  }, [upload]);

  const getFileTypeColor = (type) => {
    const colors = {
      notes: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      pyq: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      syllabus: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };
    return colors[type] || colors.other;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "text-green-600 dark:text-green-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      hard: "text-red-600 dark:text-red-400",
    };
    return colors[difficulty] || colors.medium;
  };

  // Get the correct ID (try _id first, then id, then fallback)
  const documentId = upload._id || upload.id || upload.data?.id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {upload.originalName || upload.filename || 'Unknown File'}
              </h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(
                  upload.fileType
                )}`}
              >
                {(upload.fileType || 'other').toUpperCase()}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {upload.metadata?.readingTime || 0} min read
              </span>
              <span>{upload.metadata?.wordCount || 0} words</span>
              <span className={getDifficultyColor(upload.metadata?.difficulty)}>
                {upload.metadata?.difficulty || "Medium"} difficulty
              </span>
            </div>

            {/* Show Summary Preview */}
            {upload.summary && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                {upload.summary.substring(0, 150)}...
              </p>
            )}

            {/* Debug ID Display (remove in production) */}
            <div className="text-xs text-gray-400 mb-2 font-mono">
              ID: {documentId} {!documentId && '(❌ NO ID FOUND)'}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('🖱️ View Summary button clicked');
                  console.log('📋 Document ID to pass:', documentId);
                  onViewSummary(documentId);
                }}
                icon={<Eye className="h-4 w-4" />}
                disabled={!documentId}
              >
                View Summary
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  console.log('🖱️ Generate Quiz button clicked');
                  console.log('📋 Document ID to pass:', documentId);
                  onGenerateQuiz(documentId);
                }}
                icon={<Brain className="h-4 w-4" />}
                disabled={!documentId}
              >
                Generate Quiz
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              console.log('🗑️ Delete button clicked for ID:', documentId);
              onDelete(documentId);
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={!documentId}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Topics Preview */}
      {upload.topics && upload.topics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Key Topics:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {upload.topics.slice(0, 5).map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
              >
                {topic.name}
              </span>
            ))}
            {upload.topics.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                +{upload.topics.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
