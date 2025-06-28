import React, { useState } from 'react';
import { Layout } from '../Layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  MessageSquare,
  Palette,
  FileText,
  Save,
  X
} from 'lucide-react';
import { Category } from '../../types';

export const Configuration: React.FC = () => {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory, refreshData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tone: 'professional' as Category['tone'],
    template: '',
    customPrompt: '',
    color: 'bg-blue-500',
  });

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'formal', label: 'Formal', description: 'Very structured and official' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and informal' },
  ];

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tone: 'professional',
      template: '',
      customPrompt: '',
      color: 'bg-blue-500',
    });
    setEditingCategory(null);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        tone: category.tone,
        template: category.template,
        customPrompt: category.customPrompt || '',
        color: category.color,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let success = false;
      if (editingCategory) {
        success = await updateCategory(editingCategory.id, formData);
      } else {
        success = await addCategory(formData);
      }
      
      if (success) {
        closeModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };

  if (loading.categories) {
    return (
      <Layout title="Configuration" subtitle="Manage categories, tones, and templates">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading categories..." />
        </div>
      </Layout>
    );
  }

  if (error.categories) {
    return (
      <Layout title="Configuration" subtitle="Manage categories, tones, and templates">
        <ErrorMessage 
          message={error.categories} 
          onRetry={refreshData}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Configuration" subtitle="Manage categories, tones, and templates">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Email Categories</h2>
            <p className="text-sm sm:text-base text-gray-600">Configure how AI responds to different types of emails</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${category.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => openModal(category)}
                      className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center text-sm">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Tone: </span>
                    <span className="ml-1 font-medium capitalize">{category.tone}</span>
                  </div>
                  
                  {category.customPrompt && (
                    <div className="flex items-start text-sm">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Custom prompt configured</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium mb-2 text-gray-500">Template Preview:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-3">
                    {category.template}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Create your first category to get started with AI email responses</p>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Category
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Name and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="e.g., Customer Support"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${color} border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-transparent'
                        } hover:scale-110 transition-transform`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  placeholder="Describe what types of emails this category handles"
                  required
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Response Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {toneOptions.map((tone) => (
                    <label key={tone.value} className="relative">
                      <input
                        type="radio"
                        name="tone"
                        value={tone.value}
                        checked={formData.tone === tone.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value as Category['tone'] }))}
                        className="sr-only"
                      />
                      <div className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tone === tone.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center mb-2">
                          <Palette className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900 text-sm">{tone.label}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">{tone.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Template
                </label>
                <textarea
                  value={formData.template}
                  onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  placeholder="Enter the template for automated responses in this category"
                  required
                />
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom AI Prompt <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={formData.customPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  placeholder="Add specific instructions for AI to follow when responding to this category"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};