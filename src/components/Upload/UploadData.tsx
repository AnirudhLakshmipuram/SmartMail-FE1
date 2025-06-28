import React, { useState, useRef } from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  Tag,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { CompanyDocument } from '../../types';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  preview?: string;
  selectedCategories: string[];
}

export const UploadData: React.FC = () => {
  const { categories, documents, addDocument } = useApp();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<CompanyDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            // Generate preview content
            const preview = `This is a preview of ${file.file.name}. Content includes company policies, procedures, and guidelines that will help the AI understand how to respond to customer inquiries.`;
            return { ...file, status: 'success', progress: 100, preview };
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

  const saveDocument = (uploadFile: UploadFile) => {
    const document: Omit<CompanyDocument, 'id'> = {
      name: uploadFile.file.name,
      type: uploadFile.file.type.includes('pdf') ? 'pdf' : 
            uploadFile.file.type.includes('word') ? 'doc' : 'txt',
      size: uploadFile.file.size,
      uploadDate: new Date(),
      content: uploadFile.preview || '',
      categories: uploadFile.selectedCategories
    };
    
    addDocument(document);
    removeUploadFile(uploadFile.id);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('word')) return <File className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout title="Upload Data" subtitle="Upload company documents to enhance AI knowledge base">
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-600 mb-4">
              Support for PDF, Word documents, and text files up to 10MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(uploadFile.file.type)}
                      <div>
                        <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'success' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeUploadFile(uploadFile.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
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
                              <span className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
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

                      {/* Preview */}
                      {uploadFile.preview && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{uploadFile.preview}</p>
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveDocument(uploadFile)}
                          disabled={uploadFile.selectedCategories.length === 0}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
            <span className="text-sm text-gray-500">{documents.length} documents</span>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{document.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(document.size)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setPreviewDocument(document)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="h-4 w-4 mr-1" />
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
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{previewDocument.name}</h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{previewDocument.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};