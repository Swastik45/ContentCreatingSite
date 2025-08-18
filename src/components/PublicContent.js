import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    addDoc, 
    doc, 
    getDoc,
    updateDoc,
    where,
    limit
} from 'firebase/firestore';
import { 
    FaComment, 
    FaShare, 
    FaHeart,
    FaRegHeart,
    FaEllipsisV,
    FaFlag,
    FaTimes,
    FaSearch,
    FaClock,
    FaFire,
    FaHistory,
    FaUser,
    FaImage,
    FaExpand,
    FaBookmark,
    FaRegBookmark
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Comment from './Comment';

// Enhanced Post Card Component
const PostCard = React.memo(({ post, onFullView, onReport, onShare }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const formatTimeAgo = useCallback((date) => {
        const now = new Date();
        const postDate = date.toDate ? date.toDate() : new Date(date);
        const diffInSeconds = Math.floor((now - postDate) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return postDate.toLocaleDateString();
    }, []);

    const handleBookmark = useCallback(async () => {
        if (!auth.currentUser) {
            toast.error("Please login to bookmark posts");
            return;
        }
        // Implement bookmark functionality
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    }, [isBookmarked]);

    return (
        <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
            {/* Post Image */}
            {post.image && (
                <div className="relative overflow-hidden bg-gray-100">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    <button
                        onClick={() => onFullView(post)}
                        className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        aria-label="View full post"
                    >
                        <FaExpand className="text-sm" />
                    </button>
                </div>
            )}

            <div className="p-6">
                {/* User Info & Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {post.userAvatar ? (
                                <img src={post.userAvatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FaUser className="text-sm" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">{post.username}</h4>
                            <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Post options"
                        >
                            <FaEllipsisV className="text-gray-400" />
                        </button>
                        
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 py-2">
                                <button
                                    onClick={() => {
                                        handleBookmark();
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                >
                                    {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                                    {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                                </button>
                                <button
                                    onClick={() => {
                                        onShare(post);
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                >
                                    <FaShare /> Share Post
                                </button>
                                <button
                                    onClick={() => {
                                        onReport(post.id);
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-500"
                                >
                                    <FaFlag /> Report Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                    <h3 
                        className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                        onClick={() => onFullView(post)}
                    >
                        {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                        {post.body}
                    </p>
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <LikeButton postId={post.id} />
                    <CommentCounter postId={post.id} />
                    <button
                        onClick={() => onFullView(post)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                        Read More
                    </button>
                </div>
            </div>
        </article>
    );
});

// Optimized Like Button Component
const LikeButton = React.memo(({ postId }) => {
    const [likes, setLikes] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const postDoc = await getDoc(doc(db, "content", postId));
                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    const likesArray = postData.likes || [];
                    setLikes(likesArray.length);
                    
                    if (auth.currentUser) {
                        setUserLiked(likesArray.includes(auth.currentUser.uid));
                    }
                }
            } catch (error) {
                console.error("Error fetching likes:", error);
            }
        };

        fetchLikes();
    }, [postId]);

    const handleLike = useCallback(async () => {
        if (!auth.currentUser) {
            toast.error("Please login to like posts");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const postRef = doc(db, "content", postId);
            const postDoc = await getDoc(postRef);
            
            if (postDoc.exists()) {
                const currentLikes = postDoc.data().likes || [];
                let updatedLikes;

                if (userLiked) {
                    updatedLikes = currentLikes.filter(uid => uid !== auth.currentUser.uid);
                } else {
                    updatedLikes = [...currentLikes, auth.currentUser.uid];
                }

                await updateDoc(postRef, { likes: updatedLikes });
                setLikes(updatedLikes.length);
                setUserLiked(!userLiked);
            }
        } catch (error) {
            console.error("Error updating likes:", error);
            toast.error("Failed to update like");
        } finally {
            setLoading(false);
        }
    }, [postId, userLiked, loading]);

    return (
        <button 
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                userLiked 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            } ${loading ? 'opacity-50' : ''}`}
        >
            {userLiked ? (
                <FaHeart className="animate-pulse" />
            ) : (
                <FaRegHeart />
            )}
            <span className="font-medium">{likes}</span>
        </button>
    );
});

// Comment Counter Component
const CommentCounter = React.memo(({ postId }) => {
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const q = query(collection(db, "comments"), where("postId", "==", postId));
                const querySnapshot = await getDocs(q);
                setCommentCount(querySnapshot.size);
            } catch (error) {
                console.error("Error fetching comment count:", error);
            }
        };

        fetchCommentCount();
    }, [postId]);

    return (
        <div className="flex items-center gap-2 text-gray-500">
            <FaComment />
            <span className="font-medium">{commentCount}</span>
        </div>
    );
});

// Import Comment component - moved to top with other imports

// Enhanced Full View Modal
const FullViewModal = React.memo(({ post, onClose }) => {
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Post Details</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-xl text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-6">
                        {/* User Info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {post.userAvatar ? (
                                    <img src={post.userAvatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{post.username}</h3>
                                <p className="text-gray-500">
                                    {new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Post Content */}
                        <h1 className="text-3xl font-bold mb-6 text-gray-900">{post.title}</h1>

                        {post.image && (
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full rounded-xl mb-6 shadow-lg"
                                loading="lazy"
                            />
                        )}

                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                        </div>

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between py-4 border-y border-gray-200 mb-6">
                            <div className="flex items-center gap-6">
                                <LikeButton postId={post.id} />
                                <CommentCounter postId={post.id} />
                            </div>
                            <button 
                                onClick={() => setShowComments(!showComments)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <FaComment />
                                {showComments ? 'Hide Comments' : 'Show Comments'}
                            </button>
                        </div>

                        {/* Comments */}
                        {showComments && <Comment postId={post.id} />}
                    </div>
                </div>
            </div>
        </div>
    );
});

// Main Component
const PublicContent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('recent');
    const [searchTerm, setSearchTerm] = useState('');
    const [fullViewPost, setFullViewPost] = useState(null);

    // Filter options with icons
    const filterOptions = useMemo(() => [
        { key: 'recent', label: 'Recent', icon: <FaClock /> },
        { key: 'popular', label: 'Popular', icon: <FaFire /> },
        { key: 'oldest', label: 'Oldest', icon: <FaHistory /> }
    ], []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let q;
            switch(filter) {
                case 'popular':
                    q = query(collection(db, "content"), orderBy("likes", "desc"), limit(50));
                    break;
                case 'oldest':
                    q = query(collection(db, "content"), orderBy("createdAt", "asc"), limit(50));
                    break;
                default:
                    q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(50));
            }

            const querySnapshot = await getDocs(q);
            
            const fetchedPosts = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
                    const postData = { 
                        id: docSnapshot.id, 
                        ...docSnapshot.data() 
                    };

                    try {
                        const userDoc = await getDoc(doc(db, "users", postData.creatorId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            postData.username = userData.username || 'Unknown User';
                            postData.userAvatar = userData.profilePic || null;
                        } else {
                            postData.username = 'Unknown User';
                            postData.userAvatar = null;
                        }
                    } catch (error) {
                        postData.username = 'Unknown User';
                        postData.userAvatar = null;
                    }

                    return postData;
                })
            );

            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load posts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Filter posts based on search term
    const filteredPosts = useMemo(() => {
        if (!searchTerm) return posts;
        
        return posts.filter(post => 
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [posts, searchTerm]);

    const handleReportPost = useCallback(async (postId) => {
        if (!auth.currentUser) {
            toast.error("Please login to report posts");
            return;
        }

        try {
            await addDoc(collection(db, "reports"), {
                postId,
                reporterId: auth.currentUser.uid,
                createdAt: new Date(),
                status: 'pending'
            });
            toast.success("Post reported successfully. Thank you for helping keep our community safe.");
        } catch (error) {
            console.error("Error reporting post:", error);
            toast.error("Failed to report post. Please try again.");
        }
    }, []);

    const handleSharePost = useCallback((post) => {
        const shareText = `Check out "${post.title}" by ${post.username}`;
        
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: shareText,
                url: window.location.href
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            toast.success("Post link copied to clipboard!");
        } else {
            toast.info("Sharing not supported on this device");
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading amazing content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Discover Amazing Content
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Explore stories, insights, and ideas shared by our creative community
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search posts, topics, or creators..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {filterOptions.map(option => (
                            <button
                                key={option.key}
                                onClick={() => setFilter(option.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                    filter === option.key
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {searchTerm ? (
                            <>Showing {filteredPosts.length} results for "{searchTerm}"</>
                        ) : (
                            <>Displaying {filteredPosts.length} posts</>
                        )}
                    </p>
                </div>

                {/* Posts Grid */}
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create content!'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onFullView={setFullViewPost}
                                onReport={handleReportPost}
                                onShare={handleSharePost}
                            />
                        ))}
                    </div>
                )}

                {/* Full View Modal */}
                {fullViewPost && (
                    <FullViewModal 
                        post={fullViewPost} 
                        onClose={() => setFullViewPost(null)} 
                    />
                )}
            </div>
        </div>
    );
};

export default PublicContent;