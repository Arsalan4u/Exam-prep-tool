import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Button from "./ui/Button";
import toast from "react-hot-toast";

export default function FileUpload({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log("Files dropped:", acceptedFiles, rejectedFiles);

    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles.map(f => f.errors.map(e => e.message).join(', ')).join('; ');
      toast.error(`Some files were rejected: ${reasons}`);
      return;
    }

    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: "notes",
      status: "pending",
    }));

    console.log("New files to upload:", newFiles);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"], // ✅ PDF support
      "text/plain": [".txt"], // ✅ TXT support
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB for PDFs
    maxFiles: 10,
  });

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const updateFileType = (fileId, type) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, type } : f)));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("No files to upload");
      return;
    }

    console.log("Starting upload for files:", files);
    setUploading(true);
    let successCount = 0;

    for (const fileItem of files) {
      if (fileItem.status === "uploaded") continue;

      try {
        console.log("Uploading file:", fileItem.file.name);

        setUploadProgress((prev) => ({ ...prev, [fileItem.id]: 10 }));

        const formData = new FormData();
        formData.append("file", fileItem.file);
        formData.append("fileType", fileItem.type);

        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: Math.min((prev[fileItem.id] || 10) + 15, 90)
          }));
        }, 500);

        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        clearInterval(progressInterval);
        console.log("Upload response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Upload successful:", result);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "uploaded", data: result.data }
                : f
            )
          );
          setUploadProgress((prev) => ({ ...prev, [fileItem.id]: 100 }));

          successCount++;
          if (onUpload) onUpload(result.data);
        } else {
          const errorData = await response.json();
          console.error("Upload failed:", errorData);
          throw new Error(errorData.message || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error for file:", fileItem.file.name, error);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );
        setUploadProgress((prev) => ({ ...prev, [fileItem.id]: 0 }));

        toast.error(`Failed to upload ${fileItem.file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}!`);
    }
  };

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'txt':
        return <File className="h-6 w-6 text-gray-500" />;
      default:
        return <File className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Study Materials
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your PDFs, notes, and documents for AI-powered processing
        </p>
      </div>

      {/* Enhanced Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`h-16 w-16 transition-colors ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>

          {isDragActive ? (
            <div>
              <p className="text-xl text-blue-600 font-medium mb-2">
                Drop your files here...
              </p>
              <p className="text-blue-500">
                We'll process them instantly!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xl text-gray-900 dark:text-white font-medium mb-2">
                Drag and drop your files here
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                or click to browse your computer
              </p>
              
              {/* Supported formats */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center gap-1">
                  <File className="h-4 w-4 text-gray-500" />
                  <span>TXT</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Maximum file size: 50MB • Up to 10 files at once • PDF & TXT supported
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Selected Files ({files.length})
          </h3>

          <div className="space-y-3">
            {files.map((fileItem) => (
              <FileItem
                key={fileItem.id}
                fileItem={fileItem}
                progress={uploadProgress[fileItem.id] || 0}
                onRemove={() => removeFile(fileItem.id)}
                onTypeChange={(type) => updateFileType(fileItem.id, type)}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {files.filter((f) => f.status === "uploaded").length} of{" "}
              {files.length} files uploaded
            </div>

            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                loading={uploading}
                disabled={
                  files.length === 0 ||
                  files.every((f) => f.status === "uploaded")
                }
                icon={<Upload className="h-4 w-4" />}
              >
                {uploading ? 'Processing...' : 'Upload & Process Files'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileItem({ fileItem, progress, onRemove, onTypeChange, getFileIcon }) {
  const { file, type, status, error } = fileItem;

  const getStatusIcon = () => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return getFileIcon(file);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "uploaded":
        return "border-green-200 bg-green-50 dark:bg-green-900/20";
      case "error":
        return "border-red-200 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`border rounded-xl p-4 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getStatusIcon()}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {status === "pending" && (
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="notes">📚 Notes</option>
              <option value="pyq">📝 Previous Year Questions</option>
              <option value="syllabus">📋 Syllabus</option>
              <option value="other">📄 Other</option>
            </select>
          )}

          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {status === "pending" && progress > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Processing {file.name}...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
