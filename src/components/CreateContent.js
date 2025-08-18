import React, { useState, useRef, useCallback, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { 
    FaImage, 
    FaTimes, 
    FaPlus, 
    FaEye, 
    FaEdit, 
    FaCloudUploadAlt,
    FaSpinner,
    FaTag,
    FaFolder,
    FaFileAlt,
    FaSave,
    FaRocket
} from 'react-icons/fa';

const CreateContent = () => {
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        tags: [],
        category: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [wordCount, setWordCount] = useState(0);
    
    const fileInputRef = useRef(null);
    const titleInputRef = useRef(null);

    // Predefined categories for better UX
    const categories = useMemo(() => [
        'Technology',
        'Design',
        'Business',
        'Health',
        'Education',
        'Entertainment',
        'Travel',
        'Food',
        'Lifestyle',
        'Science',
        'Art',
        'Sports',
        'Other'
    ], []);

    // Handle form field changes
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Update word count for body
        if (field === 'body') {
            const words = value.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
        }
    }, [errors]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (!formData.body.trim()) {
            newErrors.body = 'Content is required';
        } else if (formData.body.trim().length < 50) {
            newErrors.body = 'Content must be at least 50 characters';
        } else if (formData.body.trim().length > 5000) {
            newErrors.body = 'Content must be less than 5000 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle image upload and preview
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setFormData(prev => ({ ...prev, image: file }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    // Remove image
    const removeImage = useCallback(() => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Handle tag addition
    const addTag = useCallback((e) => {
        e.preventDefault();
        const tag = currentTag.trim().toLowerCase();
        
        if (!tag) return;
        
        if (formData.tags.length >= 10) {
            toast.error('Maximum 10 tags allowed');
            return;
        }
        
        if (formData.tags.includes(tag)) {
            toast.error('Tag already exists');
            return;
        }
        
        if (tag.length > 20) {
            toast.error('Tag must be less than 20 characters');
            return;
        }

        setFormData(prev => ({ 
            ...prev, 
            tags: [...prev.tags, tag] 
        }));
        setCurrentTag('');
    }, [currentTag, formData.tags]);

    // Remove tag
    const removeTag = useCallback((tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    }, []);

    // Upload image to Cloudinary
    const handleImageUpload = useCallback(async (file) => {
        if (!file) return null;
        
        setIsUploading(true);
        const url = `https://api.cloudinary.com/v1_1/dkiwvr6ml/image/upload`;
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', 'Upload-Present');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image. Please try again.');
            return null;
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        if (!auth.currentUser) {
            toast.error('Please login to create content');
            return;
        }

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload image if present
            let imageUrl = null;
            if (formData.image) {
                imageUrl = await handleImageUpload(formData.image);
                if (!imageUrl) {
                    setIsSubmitting(false);
                    return;
                }
            }

            // Prepare content data
            const contentData = {
                title: formData.title.trim(),
                body: formData.body.trim(),
                creatorId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
                tags: formData.tags,
                category: formData.category,
                image: imageUrl,
                likes: [],
                comments: 0,
                views: 0,
                wordCount: wordCount
            };

            // Save to Firestore
            await addDoc(collection(db, "content"), contentData);
            
            toast.success('🎉 Content published successfully!');
            
            // Reset form
            setFormData({
                title: '',
                body: '',
                tags: [],
                category: '',
                image: null
            });
            setImagePreview(null);
            setCurrentTag('');
            setWordCount(0);
            setPreviewMode(false);
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
        } catch (error) {
            console.error("Error creating content:", error);
            toast.error('Failed to create content. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, handleImageUpload, wordCount]);

    // Preview component
    const PreviewContent = () => (
        <div className="bg-white rounded-2xl shadow-lg border p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Untitled'}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                        <FaFolder />
                        {formData.category || 'No category'}
                    </span>
                    <span>{wordCount} words</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            {imagePreview && (
                <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full rounded-xl mb-6 shadow-md"
                />
            )}
            
            <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {formData.body || 'Start writing your content...'}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <FaEdit className="text-blue-600" />
                        Create Amazing Content
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Share your ideas, stories, and insights with the world. Make it engaging and memorable!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Editor Panel */}
                    <div className="space-y-6">
                        {/* Mode Toggle */}
                        <div className="bg-white rounded-2xl shadow-sm border p-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPreviewMode(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                        !previewMode 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaEdit /> Write
                                </button>
                                <button
                                    onClick={() => setPreviewMode(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                                        previewMode 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaEye /> Preview
                                </button>
                            </div>
                        </div>

                        {!previewMode ? (
                            /* Editor Form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Input */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                        <FaFileAlt className="text-blue-600" />
                                        Title *
                                    </label>
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="Enter an engaging title..."
                                        className={`w-full px-4 py-3 text-lg border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        maxLength={100}
                                    />
                                    <div className="flex justify-between mt-2">
                                        {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                                        <span className="text-sm text-gray-400 ml-auto">
                                            {formData.title.length}/100
                                        </span>
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                        <FaFolder className="text-green-600" />
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="text-red-500 text-sm mt-2 block">{errors.category}</span>}
                                </div>

                                {/* Content Body */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                        <FaFileAlt className="text-purple-600" />
                                        Content * 
                                        <span className="text-sm text-gray-500 font-normal ml-auto">
                                            {wordCount} words, {formData.body.length}/5000 characters
                                        </span>
                                    </label>
                                    <textarea
                                        value={formData.body}
                                        onChange={(e) => handleInputChange('body', e.target.value)}
                                        placeholder="Tell your story... What insights, experiences, or ideas do you want to share?"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                                            errors.body ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        rows={12}
                                        maxLength={5000}
                                    />
                                    {errors.body && <span className="text-red-500 text-sm mt-2 block">{errors.body}</span>}
                                </div>

                                {/* Tags Section */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                        <FaTag className="text-orange-600" />
                                        Tags
                                        <span className="text-sm text-gray-500 font-normal">({formData.tags.length}/10)</span>
                                    </label>
                                    
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                                            placeholder="Add a tag..."
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <FaPlus /> Add
                                        </button>
                                    </div>
                                    
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag, index) => (
                                                <span 
                                                    key={index} 
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="hover:text-blue-600 transition-colors"
                                                    >
                                                        <FaTimes className="text-xs" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Image Upload */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                                        <FaImage className="text-pink-600" />
                                        Cover Image
                                        <span className="text-sm text-gray-500 font-normal">(Optional, max 5MB)</span>
                                    </label>
                                    
                                    {!imagePreview ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                        >
                                            <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-2">Click to upload an image</p>
                                            <p className="text-sm text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="bg-white rounded-2xl shadow-sm border p-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isUploading}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting || isUploading ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                {isUploading ? 'Uploading Image...' : 'Publishing...'}
                                            </>
                                        ) : (
                                            <>
                                                <FaRocket />
                                                Publish Content
                                            </>
                                        )}
                                    </button>
                                    
                                    <p className="text-center text-sm text-gray-500 mt-3">
                                        Your content will be visible to all users immediately after publishing.
                                    </p>
                                </div>
                            </form>
                        ) : null}
                    </div>

                    {/* Preview Panel - Always visible on large screens */}
                    <div className="lg:block hidden">
                        <div className="sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaEye className="text-blue-600" />
                                Live Preview
                            </h2>
                            <PreviewContent />
                        </div>
                    </div>

                    {/* Preview Panel - Show when in preview mode on smaller screens */}
                    {previewMode && (
                        <div className="lg:hidden">
                            <PreviewContent />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateContent;