import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    where,
    doc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';
import { 
    FaEdit, 
    FaTrash, 
    FaEllipsisV,
    FaFilter,
    FaSearch,
    FaCamera,
    FaCalendarAlt,
    FaHeart,
    FaComment,
    FaEye,
    FaTimes,
    FaCheck,
    FaImage,
    FaSpinner,
    FaChevronDown,
    FaChevronUp,
    FaPlus,
    FaArrowUp
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Comment from './Comment';
import Like from './Like';

const MyContent = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('recent');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedPost, setExpandedPost] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cloudinary image upload function
    const handleImageUpload = useCallback(async (file) => {
        if (!file) return null;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return null;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return null;
        }

        const url = `https://api.cloudinary.com/v1_1/dkiwvr6ml/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Upload-Present');

        setUploading(true);
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error(data.error?.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(`Failed to upload image: ${error.message}`);
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    // Fetch posts
    const fetchMyPosts = useCallback(async () => {
        if (!auth.currentUser) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const q = query(
                collection(db, "content"), 
                where("creatorId", "==", auth.currentUser.uid), 
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            
            const fetchedPosts = querySnapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data(),
                createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date()
            }));

            setPosts(fetchedPosts);
            setError('');
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to fetch your content. Please try again.");
            toast.error("Failed to fetch content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyPosts();
    }, [fetchMyPosts]);

    // Enhanced filtering and search
    const processedPosts = useMemo(() => {
        let result = [...posts];

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(post => 
                post.title?.toLowerCase().includes(searchLower) ||
                post.body?.toLowerCase().includes(searchLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        switch(filterOption) {
            case 'likes':
                result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
                break;
            case 'comments':
                result.sort((a, b) => (b.comments || 0) - (a.comments || 0));
                break;
            case 'oldest':
                result.sort((a, b) => a.createdAt - b.createdAt);
                break;
            default:
                result.sort((a, b) => b.createdAt - a.createdAt);
        }

        return result;
    }, [posts, searchTerm, filterOption]);

    useEffect(() => {
        setFilteredPosts(processedPosts);
    }, [processedPosts]);

    // Delete handler
    const handleDeletePost = useCallback(async (postId) => {
        try {
            await deleteDoc(doc(db, "content", postId));
            setPosts(prev => prev.filter(post => post.id !== postId));
            setDeleteConfirm(null);
            toast.success("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post. Please try again.");
        }
    }, []);

    // Edit handler
    const handleEditPost = useCallback(async (e) => {
        e.preventDefault();
        
        if (!editingPost) return;

        try {
            if (!editingPost.title?.trim() || !editingPost.body?.trim()) {
                toast.error("Title and body cannot be empty");
                return;
            }

            if (editingPost.title.length > 200) {
                toast.error("Title must be less than 200 characters");
                return;
            }

            if (editingPost.body.length > 5000) {
                toast.error("Body must be less than 5000 characters");
                return;
            }

            let imageUrl = editingPost.image;
            if (newImage) {
                imageUrl = await handleImageUpload(newImage);
                if (!imageUrl) return;
            }

            const postRef = doc(db, "content", editingPost.id);
            const updateData = {
                title: editingPost.title.trim(),
                body: editingPost.body.trim(),
                updatedAt: new Date()
            };

            if (imageUrl !== undefined) {
                updateData.image = imageUrl;
            }

            await updateDoc(postRef, updateData);

            setPosts(prev => prev.map(post => 
                post.id === editingPost.id 
                    ? { ...post, ...updateData } 
                    : post
            ));
            
            setEditingPost(null);
            setNewImage(null);
            setImagePreview(null);
            
            toast.success("Post updated successfully!");
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error("Failed to update post. Please try again.");
        }
    }, [editingPost, newImage, handleImageUpload]);

    // Handle image selection
    const handleImageSelect = useCallback((file) => {
        if (!file) return;
        
        setNewImage(file);
        
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    // Cancel editing
    const cancelEdit = useCallback(() => {
        setEditingPost(null);
        setNewImage(null);
        setImagePreview(null);
    }, []);

    // Format date
    const formatDate = useCallback((date) => {
        if (!date) return '';
        const now = new Date();
        const postDate = new Date(date);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }).format(postDate);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your content...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md"
                >
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={fetchMyPosts}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Sticky Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    {/* Title and Stats */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                My Content
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </p>
                        </div>
                        
                        {/* Filter Pills */}
                        <div className="flex gap-2">
                            {[
                                { key: 'recent', label: 'Recent', icon: '🕐' },
                                { key: 'oldest', label: 'Oldest', icon: '📅' },
                                { key: 'likes', label: 'Liked', icon: '❤️' },
                            ].map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setFilterOption(option.key)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        filterOption === option.key
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <span className="mr-1.5">{option.icon}</span>
                                    <span className="hidden sm:inline">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchTerm && (
                        <div className="mt-3 text-sm text-gray-600">
                            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {filteredPosts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-md p-12 text-center"
                    >
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchTerm ? 'No posts found' : 'No content yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm 
                                ? 'Try adjusting your search terms' 
                                : 'Create your first post to get started!'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                            >
                                {/* Post Image */}
                                {post.image && (
                                    <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button
                                                onClick={() => setEditingPost({
                                                    id: post.id,
                                                    title: post.title,
                                                    body: post.body,
                                                    image: post.image
                                                })}
                                                className="bg-white/90 backdrop-blur-sm text-blue-600 p-2 rounded-lg hover:bg-white transition-all shadow-md"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(post.id)}
                                                className="bg-white/90 backdrop-blur-sm text-red-600 p-2 rounded-lg hover:bg-white transition-all shadow-md"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    {/* Header with actions (no image case) */}
                                    {!post.image && (
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1"></div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingPost({
                                                        id: post.id,
                                                        title: post.title,
                                                        body: post.body,
                                                        image: post.image
                                                    })}
                                                    className="text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(post.id)}
                                                    className="text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Post Title */}
                                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                        {post.title}
                                    </h2>

                                    {/* Post Content */}
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                                        {post.body}
                                    </p>

                                    {/* Post Meta */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <FaCalendarAlt />
                                            <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <FaHeart className="text-red-500" />
                                                <span className="text-gray-700 font-medium">{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <FaComment className="text-blue-500" />
                                                <span className="text-gray-700 font-medium">{post.comments || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Comments */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                                        >
                                            {expandedPost === post.id ? <FaChevronUp /> : <FaChevronDown />}
                                            {expandedPost === post.id ? 'Hide Comments' : 'View Comments'}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {expandedPost === post.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                                        <Comment postId={post.id} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
                        aria-label="Scroll to top"
                    >
                        <FaArrowUp />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
                                <h3 className="text-xl font-bold text-gray-900">Edit Post</h3>
                                <button
                                    onClick={cancelEdit}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditPost} className="p-6 space-y-5">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        value={editingPost.title || ''} 
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                        placeholder="Enter post title..."
                                        maxLength="200"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {editingPost.title?.length || 0}/200
                                    </div>
                                </div>

                                {/* Body Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Content *
                                    </label>
                                    <textarea 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" 
                                        rows="8"
                                        value={editingPost.body || ''} 
                                        onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                                        placeholder="Write your content..."
                                        maxLength="5000"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {editingPost.body?.length || 0}/5000
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image
                                    </label>
                                    
                                    {/* Current or Preview Image */}
                                    {(editingPost.image || imagePreview) && (
                                        <div className="mb-3 relative">
                                            <img 
                                                src={imagePreview || editingPost.image} 
                                                alt="Preview" 
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                            <p className="text-sm text-gray-500 mt-2">
                                                {imagePreview ? 'New image preview' : 'Current image'}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50">
                                        <FaCamera className="text-gray-400" />
                                        <span className="text-gray-600">Choose Image</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => handleImageSelect(e.target.files[0])}
                                            accept="image/*"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPEG, PNG, GIF, WebP (max 10MB)
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={uploading || !editingPost.title?.trim() || !editingPost.body?.trim()}
                                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-colors disabled:cursor-not-allowed font-medium flex-1"
                                    >
                                        {uploading ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaTrash className="text-red-600 text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Delete Post
                                </h3>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this post? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeletePost(deleteConfirm)}
                                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-colors font-medium flex-1"
                                >
                                    <FaTrash />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyContent;