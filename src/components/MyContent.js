import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    FaChevronUp
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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Cloudinary image upload function with better error handling
    const handleImageUpload = useCallback(async (file) => {
        if (!file) return null;
        
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
            return null;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
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

    // Fetch posts with better error handling
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

    // Enhanced filtering and search with memoization
    const processedPosts = useMemo(() => {
        let result = [...posts];

        // Search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(post => 
                post.title?.toLowerCase().includes(searchLower) ||
                post.body?.toLowerCase().includes(searchLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Sort filter
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
            default: // recent
                result.sort((a, b) => b.createdAt - a.createdAt);
        }

        return result;
    }, [posts, searchTerm, filterOption]);

    useEffect(() => {
        setFilteredPosts(processedPosts);
    }, [processedPosts]);

    // Enhanced delete handler with confirmation modal
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

    // Enhanced edit handler with validation
    const handleEditPost = useCallback(async (e) => {
        e.preventDefault();
        
        if (!editingPost) return;

        try {
            // Validation
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

            // Handle image upload if a new image is selected
            let imageUrl = editingPost.image;
            if (newImage) {
                imageUrl = await handleImageUpload(newImage);
                if (!imageUrl) return; // Upload failed
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
            
            // Reset states
            setEditingPost(null);
            setNewImage(null);
            setImagePreview(null);
            
            toast.success("Post updated successfully!");
        } catch (error) {
            console.error("Error updating post:", error);
            toast.error("Failed to update post. Please try again.");
        }
    }, [editingPost, newImage, handleImageUpload]);

    // Handle image selection with preview
    const handleImageSelect = useCallback((file) => {
        if (!file) return;
        
        setNewImage(file);
        
        // Create preview
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
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your content...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                    onClick={fetchMyPosts}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">My Content</h1>
                    <p className="text-gray-600">
                        {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
                    </p>
                </div>

                {/* Search, Filter, and View Controls */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-grow max-w-md">
                            <input 
                                type="text"
                                placeholder="Search your posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>

                        {/* Filter and View Controls */}
                        <div className="flex gap-3">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <select 
                                    value={filterOption}
                                    onChange={(e) => setFilterOption(e.target.value)}
                                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="likes">Most Liked</option>
                                    <option value="comments">Most Commented</option>
                                </select>
                                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* View Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Results Info */}
                    {searchTerm && (
                        <div className="mt-4 text-sm text-gray-600">
                            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} 
                            matching "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Posts Display */}
                {filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {searchTerm ? 'No posts found' : 'No content yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm 
                                ? 'Try adjusting your search terms or filters' 
                                : 'Create your first post to get started!'
                            }
                        </p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                        : 'space-y-6'
                    }>
                        {filteredPosts.map(post => (
                            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Post Image */}
                                {post.image && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Post Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                                            {post.title}
                                        </h2>
                                        
                                        <div className="flex gap-2 ml-3">
                                            <button
                                                onClick={() => setEditingPost({
                                                    id: post.id,
                                                    title: post.title,
                                                    body: post.body,
                                                    image: post.image
                                                })}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit post"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(post.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete post"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <p className="text-gray-700 mb-4 line-clamp-3">
                                        {post.body}
                                    </p>

                                    {/* Post Meta */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            <FaCalendarAlt className="text-xs" />
                                            <span>{formatDate(post.createdAt)}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <FaHeart className="text-red-500" />
                                                <span>{post.likes?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaComment className="text-blue-500" />
                                                <span>{post.comments || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    <div className="mt-4">
                                        <Comment postId={post.id} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                {editingPost && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-semibold">Edit Post</h3>
                                <button
                                    onClick={cancelEdit}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditPost} className="p-6 space-y-4">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content *
                                    </label>
                                    <textarea 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image
                                    </label>
                                    
                                    {/* Current Image */}
                                    {editingPost.image && !imagePreview && (
                                        <div className="mb-3">
                                            <img 
                                                src={editingPost.image} 
                                                alt="Current" 
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">Current image</p>
                                        </div>
                                    )}
                                    
                                    {/* Image Preview */}
                                    {imagePreview && (
                                        <div className="mb-3">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">New image preview</p>
                                        </div>
                                    )}
                                    
                                    <input 
                                        type="file" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                        onChange={(e) => handleImageSelect(e.target.files[0])}
                                        accept="image/*"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: JPEG, PNG, GIF, WebP (max 10MB)
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={uploading || !editingPost.title?.trim() || !editingPost.body?.trim()}
                                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
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
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Delete Post
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeletePost(deleteConfirm)}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FaTrash />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyContent;