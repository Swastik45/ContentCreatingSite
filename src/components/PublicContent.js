import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
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
    FaExpand,
    FaBookmark,
    FaRegBookmark,
    FaArrowUp
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Comment from './Comment';

// Masonry-style Post Card Component
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
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    }, [isBookmarked]);

    const handleCommentClick = useCallback(() => {
        onFullView(post, true);
    }, [onFullView, post]);

    return (
        <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
            {/* Post Image */}
            {post.image && (
                <div className="relative overflow-hidden cursor-pointer" onClick={() => onFullView(post)}>
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md"
                        aria-label="Expand"
                    >
                        <FaExpand className="text-sm" />
                    </button>
                </div>
            )}

            <div className="p-5">
                {/* User Info & Actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {post.userAvatar ? (
                                <img src={post.userAvatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FaUser className="text-xs" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{post.username}</h4>
                            <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Options"
                        >
                            <FaEllipsisV className="text-gray-500" />
                        </button>

                        {showOptions && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
                                <button
                                    onClick={() => {
                                        handleBookmark();
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-sm transition-colors"
                                >
                                    {isBookmarked ? <FaBookmark className="text-blue-600" /> : <FaRegBookmark />}
                                    {isBookmarked ? 'Unsave' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        onShare(post);
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-sm transition-colors"
                                >
                                    <FaShare /> Share
                                </button>
                                <button
                                    onClick={() => {
                                        onReport(post.id);
                                        setShowOptions(false);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 text-sm transition-colors"
                                >
                                    <FaFlag /> Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className="mb-4 cursor-pointer" onClick={() => onFullView(post)}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                        {post.body}
                    </p>
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <LikeButton postId={post.id} />
                        <CommentCounter postId={post.id} onClick={handleCommentClick} />
                    </div>
                    <button
                        onClick={() => onShare(post)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="Share"
                    >
                        <FaShare />
                    </button>
                </div>
            </div>
        </motion.article>
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
            className={`flex items-center gap-1.5 transition-all duration-200 ${
                userLiked 
                    ? 'text-red-500' 
                    : 'text-gray-500 hover:text-red-500'
            } ${loading ? 'opacity-50' : ''}`}
        >
            {userLiked ? (
                <FaHeart className="text-base" />
            ) : (
                <FaRegHeart className="text-base" />
            )}
            <span className="text-sm font-medium">{likes}</span>
        </button>
    );
});

// Comment Counter Component
const CommentCounter = React.memo(({ postId, onClick }) => {
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
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
        >
            <FaComment className="text-base" />
            <span className="text-sm font-medium">{commentCount}</span>
        </button>
    );
});

// Full View Modal with Side-by-Side Layout
const FullViewModal = React.memo(({ post, onClose, initialShowComments = false }) => {
    const [showComments, setShowComments] = useState(initialShowComments);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex"
            >
                {/* Left Side - Image */}
                {post.image && (
                    <div className="hidden md:flex w-1/2 bg-black items-center justify-center">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}

                {/* Right Side - Content */}
                <div className={`flex flex-col ${post.image ? 'md:w-1/2' : 'w-full'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {post.userAvatar ? (
                                    <img src={post.userAvatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{post.username}</h3>
                                <p className="text-xs text-gray-500">
                                    {new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <FaTimes className="text-gray-600" />
                        </button>
                    </div>

                    {/* Mobile Image */}
                    {post.image && (
                        <div className="md:hidden w-full bg-black">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900">{post.title}</h1>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">{post.body}</p>

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between py-4 border-y border-gray-200 mb-6">
                            <div className="flex items-center gap-6">
                                <LikeButton postId={post.id} />
                                <CommentCounter postId={post.id} onClick={() => setShowComments(!showComments)} />
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-700 mb-4"
                            >
                                {showComments ? 'Hide Comments' : 'View All Comments'}
                            </button>
                            {showComments && (
                                <div className="animate-in fade-in duration-300">
                                    <Comment postId={post.id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
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
    const [showCommentsInModal, setShowCommentsInModal] = useState(false);
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

    const handleFullView = useCallback((post, showComments = false) => {
        setFullViewPost(post);
        setShowCommentsInModal(showComments);
    }, []);

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading content...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Fixed Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Explore
                        </h1>
                        <div className="flex gap-2">
                            {filterOptions.map(option => (
                                <button
                                    key={option.key}
                                    onClick={() => setFilter(option.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        filter === option.key
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {option.icon}
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
                            placeholder="Search posts..."
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
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Try different search terms' : 'Be the first to post!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onFullView={handleFullView}
                                onReport={handleReportPost}
                                onShare={handleSharePost}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp />
                </motion.button>
            )}

            {/* Full View Modal */}
            {fullViewPost && (
                <FullViewModal
                    post={fullViewPost}
                    onClose={() => {
                        setFullViewPost(null);
                        setShowCommentsInModal(false);
                    }}
                    initialShowComments={showCommentsInModal}
                />
            )}
        </div>
    );
};

export default PublicContent;