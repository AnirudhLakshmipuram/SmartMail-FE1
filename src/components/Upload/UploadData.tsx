import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  Tag,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  selectedCategories: string[];
  error?: string;
}

export const UploadData: React.FC = () => {
  const { categories, documents, loading, error, addDocument, deleteDocument, loadPageData } = useApp();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load upload page data when component mounts
  useEffect(() => {
    console.log('📁 Upload page mounted - loading categories and documents');
    loadPageData('upload');
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });

    const newUploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0,
      selectedCategories: []
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Simulate upload process
    newUploadFiles.forEach(uploadFile => {
      simulateUpload(uploadFile);
    });
  };

  const simulateUpload = (uploadFile: UploadFile) => {
    const interval = setInterval(() => {
      setUploadFiles(prev => prev.map(file => {
        if (file.id === uploadFile.id) {
          const newProgress = Math.min(file.progress + Math.random() * 30, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...file, status: 'success', progress: 100 };
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 200);
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const updateFileCategories = (id: string, categories: string[]) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, selectedCategories: categories } : file
    ));
  };

  const saveDocument = async (uploadFile: UploadFile) => {
    const success = await addDocument(uploadFile.file, uploadFile.selectedCategories);
    if (success) {
      removeUploadFile(uploadFile.id);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />;
    if (type.includes('word')) return <File className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />;
    return <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading.categories || loading.documents) {
    return (
      <Layout title="Upload Data" subtitle="Upload company documents to enhance AI knowledge base">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading upload page..." />
        </div>
      </Layout>
    );
  }

  if (error.categories || error.documents) {
    const errorMessage = error.categories || error.documents;
    return (
      <Layout title="Upload Data" subtitle="Upload company documents to enhance AI knowledge base">
        <ErrorMessage 
          message={errorMessage || 'Failed to load data'} 
          onRetry={() => loadPageData('upload')}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Upload Data" subtitle="Upload company documents to enhance AI knowledge base">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Document Management</h2>
            <p className="text-sm sm:text-base text-gray-600">Upload and organize your company documents</p>
          </div>
          <button
            onClick={() => loadPageData('upload')}
            disabled={loading.categories || loading.documents}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${(loading.categories || loading.documents) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Support for PDF, Word documents, and text files up to 10MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(uploadFile.file.type)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{uploadFile.file.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'success' && (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeUploadFile(uploadFile.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        uploadFile.status === 'success' ? 'bg-green-500' :
                        uploadFile.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>

                  {/* Category Selection */}
                  {uploadFile.status === 'success' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign Categories
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <label key={category.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={uploadFile.selectedCategories.includes(category.id)}
                                onChange={(e) => {
                                  const newCategories = e.target.checked
                                    ? [...uploadFile.selectedCategories, category.id]
                                    : uploadFile.selectedCategories.filter(id => id !== category.id);
                                  updateFileCategories(uploadFile.id, newCategories);
                                }}
                                className="sr-only"
                              />
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                uploadFile.selectedCategories.includes(category.id)
                                  ? `${category.color} text-white`
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}>
                                {category.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveDocument(uploadFile)}
                          disabled={uploadFile.selectedCategories.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          Save Document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Uploaded Documents</h3>
              <p className="text-sm text-gray-500">{documents.length} documents</p>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getFileIcon(document.type)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{document.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setPreviewDocument(document)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>Categories: {document.categories.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {document.categories.slice(0, 2).map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <span key={categoryId} className={`${category.color} text-white text-xs px-2 py-1 rounded-full`}>
                            {category.name}
                          </span>
                        ) : null;
                      })}
                      {document.categories.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{document.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{previewDocument.name}</h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{previewDocument.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};