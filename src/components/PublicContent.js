import React, { useState, useEffect } from 'react';
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
    where
} from 'firebase/firestore';
import { 
    FaComment, 
    FaShare, 
    FaHeart,
    FaRegHeart,
    FaEllipsisV,
    FaFlag,
    FaTimes,
    FaThumbsUp,
    FaThumbsDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';




// Interaction Dropdown Component
const PostInteractionDropdown = ({ post, onClose, onReport, onShare }) => {
    return (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
            <ul className="py-1">
                <li 
                    onClick={() => {
                        onShare(post);
                        onClose();
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                    <FaShare className="mr-2" /> Share Post
                </li>
                <li 
                    onClick={() => {
                        onReport(post.id);
                        onClose();
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500"
                >
                    <FaFlag className="mr-2" /> Report Post
                </li>
            </ul>
        </div>
    );
};

// Like Component
const LikeButton = ({ postId }) => {
    const [likes, setLikes] = useState(0);
    const [userLiked, setUserLiked] = useState(false);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const postDoc = await getDoc(doc(db, "content", postId));
                const postData = postDoc.data();
                setLikes(postData.likes?.length || 0);
                
                // Check if current user has liked the post
                if (auth.currentUser) {
                    setUserLiked(
                        postData.likes?.includes(auth.currentUser.uid) || false
                    );
                }
            } catch (error) {
                console.error("Error fetching likes:", error);
            }
        };

        fetchLikes();
    }, [postId]);

    const handleLike = async () => {
        if (!auth.currentUser) {
            toast.error("You must be logged in to like a post.");
            return;
        }

        try {
            const postRef = doc(db, "content", postId);
            const postDoc = await getDoc(postRef);
            const currentLikes = postDoc.data().likes || [];

            let updatedLikes;
            if (userLiked) {
                // Unlike the post
                updatedLikes = currentLikes.filter(
                    uid => uid !== auth.currentUser.uid
                );
            } else {
                // Like the post
                updatedLikes = [...currentLikes, auth.currentUser.uid];
            }

            await updateDoc(postRef, { likes: updatedLikes });
            
            setLikes(updatedLikes.length);
            setUserLiked(!userLiked);
        } catch (error) {
            console.error("Error updating likes:", error);
            toast.error("Failed to update likes.");
        }
    };

    return (
        <button 
            onClick={handleLike} 
            className="flex items-center space-x-2"
        >
            {userLiked ? (
                <FaHeart className="text-red-500" />
            ) : (
                <FaRegHeart className="text-gray-500" />
            )}
            <span>{likes}</span>
        </button>
    );
};

// Comment Section Component
const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch comments
    const fetchComments = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "comments"), 
                where("postId", "==", postId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            
            const fetchedComments = await Promise.all(
                querySnapshot.docs.map(async (commentDoc) => {
                    const commentData = { 
                        id: commentDoc.id, 
                        ...commentDoc.data() 
                    };

                    // Fetch username
                    try {
                        const userDoc = doc(db, "users", commentData.userId);
                        const userSnapshot = await getDoc(userDoc);
                        
                        commentData.username = userSnapshot.exists() 
                            ? userSnapshot.data().username 
                            : 'Anonymous';
                    } catch (userError) {
                        console.error("Error fetching comment user:", userError);
                        commentData.username = 'Anonymous';
                    }

                    return commentData;
                })
            );

            setComments(fetchedComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    // Initial comments fetch
    useEffect(() => {
        fetchComments();
    }, [postId]);

    // Submit new comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        // Check if user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast.error("You must be logged in to comment");
            return;
        }

        // Validate comment
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        try {
            // Add comment to Firestore
            await addDoc(collection(db, "comments"), {
                postId,
                userId: currentUser.uid,
                comment: newComment.trim(),
                createdAt: new Date()
            });

            // Clear input and refresh comments
            setNewComment('');
            await fetchComments();

            toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        }
    };

    return (
        <div className="comment-section mt-4">
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex mb-4">
                <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-grow border rounded-l p-2"
                />
                <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                    Post
                </button>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="text-center text-gray-500">Loading comments...</div>
            ) : (
                <div className="comments-list max-h-64 overflow-y-auto">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center">No comments yet</p>
                    ) : (
                        comments.map((comment) => (
                            <div 
                                key={comment.id} 
                                 className="bg-gray-100 p-3 rounded mb-2"
                            >
                                <div className="flex items-center mb-2">
                                    <strong className="mr-2">{comment.username}</strong>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(comment.createdAt.toDate()).toLocaleString()}
                                    </span>
                                </div>
                                <p>{comment.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Full View Modal Component
const FullViewModal = ({ post, onClose }) => {
    const [showComments, setShowComments] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-60"
                >
                    <FaTimes className="text-3xl" />
                </button>

                {/* Post Content */}
                <div className="p-8">
                    {/* User Info */}
                    <div className="flex items-center mb-6">
                        <img 
                            src={post.userAvatar || 'default-avatar.png'} 
                            alt={post.username} 
                            className="w-16 h-16 rounded-full mr-4"
                        />
                        <div>
                            <h3 className="text-2xl font-bold">{post.username}</h3>
                            <p className="text-gray-500">
                                {new Date(post.createdAt.toDate()).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Post Title */}
                    <h2 className="text-4xl font-bold mb-6 text-gray-800">{post.title}</h2>

                    {/* Post Image */}
                    {post.image && (
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-auto mb-6 rounded-lg"
                        />
                    )}

                    {/* Post Body */}
                    <p className="text-lg text-gray-700 mb-6">{post.body}</p>

                    {/* Interaction Buttons */}
                    <div className="flex space-x-4 mb-4">
                        <LikeButton postId={post.id} />
                        <button 
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center text-gray-600"
                        >
                            <FaComment className="mr-2" />
                            {showComments ? 'Hide Comments' : 'Show Comments'}
                        </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && <CommentSection postId={post.id} />}
                </div>
            </div>
        </div>
    );
};

// Main Public Content Component
const PublicContent = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('recent');
    const [searchTerm, setSearchTerm] = useState('');
    const [fullViewPost, setFullViewPost] = useState(null);
    const [openOptionsPostId, setOpenOptionsPostId] = useState(null);

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let q;
                switch(filter) {
                    case 'popular':
                        q = query(
                            collection(db, "content"), 
                            orderBy("likes", "desc")
                        );
                        break;
                    case 'oldest':
                        q = query(
                            collection(db, "content"), 
                            orderBy("createdAt", "asc")
                        );
                        break;
                    default:
                        q = query(
                            collection(db, "content"), 
                            orderBy("createdAt", "desc")
                        );
                }

                const querySnapshot = await getDocs(q);
                
                const fetchedPosts = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const postData = { 
                            id: docSnapshot.id, 
                            ...docSnapshot.data() 
                        };

                        try {
                            const userDoc = doc(db, "users", postData.creatorId);
                            const userSnapshot = await getDoc(userDoc);
                            
                            if (userSnapshot.exists()) {
                                postData.username = userSnapshot.data().username || 'Unknown User';
                                postData.userAvatar = userSnapshot.data().profilePic || null;
 } else {
                                postData.username = 'Unknown User';
                                postData.userAvatar = null;
                            }
                        } catch (userError) {
                            console.error("Error fetching user:", userError);
                            postData.username = 'Unknown User';
                            postData.userAvatar = null;
                        }

                        return postData;
                    })
                );

                // Apply search filter
                const filteredPosts = fetchedPosts.filter(post => 
                    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.username.toLowerCase().includes(searchTerm.toLowerCase())
                );

                setPosts(filteredPosts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching public posts: ", error);
                setError("Failed to fetch public content. Please try again.");
                setLoading(false);
            }
        };

        fetchPosts();
    }, [filter, searchTerm]);

    // Click outside listener for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.options-dropdown')) {
                setOpenOptionsPostId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle full view of a post
    const toggleFullView = (post) => {
        setFullViewPost(prevPost => 
            prevPost && prevPost.id === post.id ? null : post
        );
    };

    // Handle report post
    const handleReportPost = async (postId) => {
        try {
            if (!auth.currentUser  ) {
                toast.error("You must be logged in to report a post.");
                return;
            }

            await addDoc(collection(db, "reports"), {
                postId,
                reporterId: auth.currentUser  .uid,
                createdAt: new Date(),
                status: 'pending'
            });

            toast.success("Post reported successfully. Our team will review it.");
        } catch (error) {
            console.error("Error reporting post: ", error);
            toast.error("Failed to report post. Please try again.");
        }
    };

    // Handle share post
    const handleSharePost = (post) => {
        try {
            navigator.clipboard.writeText(
                `Check out this post by ${post.username}:\n\n${post.title}\n\n${post.body}`
            );
            toast.info("Post link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to share post.");
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Public Content</h1>

           {/* Search Bar */}
<div className="relative mb-4 w-full">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
        </svg>
    </div>
    <input 
        type="text" 
        placeholder="Search posts, topics, or users..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="
            w-full 
            pl-10 
            pr-4 
            py-2 
            border 
            border-gray-300 
            rounded-full 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-transparent 
            transition 
            duration-300 
            ease-in-out 
            text-gray-700 
            placeholder-gray-400
            shadow-sm
            hover:shadow-md
        "
    />
    {searchTerm && (
        <button 
            onClick={() => setSearchTerm('')}
            className="
                absolute 
                inset-y-0 
                right-0 
                pr-3 
                flex 
                items-center 
                text-gray-400 
                hover:text-gray-600
                transition
                duration-200
            "
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
            >
                <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clipRule="evenodd" 
                />
            </svg>
        </button>
    )}
</div>

            {/* Filter Options */}
<div className="mb-4 flex justify-center space-x-4">
    <button 
        onClick={() => setFilter('recent')} 
        className={`
            px-4 py-2 rounded-full transition duration-300 ease-in-out
            ${filter === 'recent' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
            }
        `}
    >
        <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Recent
        </span>
    </button>
    
    <button 
        onClick={() => setFilter('popular')} 
        className={`
            px-4 py-2 rounded-full transition duration-300 ease-in-out
            ${filter === 'popular' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
            }
        `}
    >
        <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Popular
        </span>
    </button>
    
    <button 
        onClick={() => setFilter('oldest')} 
        className={`
            px-4 py-2 rounded-full transition duration-300 ease-in-out
            ${filter === 'oldest' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
            }
        `}
    >
        <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            Oldest
        </span>
    </button>
</div>

            {/* Posts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition relative">
                        <h2 className="text-xl font-bold cursor-pointer" onClick={() => toggleFullView(post)}>
                            {post.title}
                        </h2>
                        <p className="text-gray-600">{post.body.substring(0, 100)}...</p>
                        <div className="absolute top-2 right-2">
                            <button onClick={() => setOpenOptionsPostId(post.id)} className="text-gray-500 hover:text-gray-900">
                                <FaEllipsisV />
                            </button>
                            {openOptionsPostId === post.id && (
                                <PostInteractionDropdown 
                                    post={post} 
                                    onClose={() => setOpenOptionsPostId(null)} 
                                    onReport={handleReportPost} 
                                    onShare={handleSharePost} 
                                />
                            )}
                        </div>
                        <LikeButton postId={post.id} />
                        <button onClick={() => toggleFullView(post)} className="text-blue-500 mt-2">Read More</button>
                    </div>
                ))}
            </div>

            {/* Full View Modal */}
            {fullViewPost && (
                <FullViewModal 
                    post={fullViewPost} 
                    onClose={() => setFullViewPost(null)} 
                />
            )}
        </div>
    );
};

export default PublicContent;