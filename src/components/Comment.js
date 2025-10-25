import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    getDocs,
    setDoc
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import {
    FaComment,
    FaTrash,
    FaEdit,
    FaPaperPlane,
    FaUserCircle,
    FaTimes,
    FaCheck,
    FaReply,
    FaHeart,
    FaRegHeart
} from 'react-icons/fa';

const Comment = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [likes, setLikes] = useState({});

    const currentUser = auth.currentUser;

    // Fetch comments for the post
    useEffect(() => {
        if (!postId) return;

        const q = query(
            collection(db, 'comments'),
            where('postId', '==', postId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Fetch likes for each comment
            const likesData = {};
            for (const comment of commentsData) {
                const likesQuery = query(collection(db, 'comments', comment.id, 'likes'));
                const likesSnapshot = await getDocs(likesQuery);
                likesData[comment.id] = {
                    count: likesSnapshot.size,
                    liked: likesSnapshot.docs.some(doc => doc.id === currentUser?.uid)
                };
            }
            setLikes(likesData);
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load comments');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId, currentUser]);

    // Handle adding a new comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        if (!currentUser) {
            toast.error('Please login to comment');
            return;
        }

        setSubmitting(true);

        try {
            await addDoc(collection(db, 'comments'), {
                postId,
                text: newComment.trim(),
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setNewComment('');
            toast.success('Comment added successfully!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle deleting a comment
    const handleDeleteComment = async (commentId, commentUserId) => {
        if (!currentUser || currentUser.uid !== commentUserId) {
            toast.error('You can only delete your own comments');
            return;
        }

        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteDoc(doc(db, 'comments', commentId));
                toast.success('Comment deleted successfully!');
            } catch (error) {
                console.error('Error deleting comment:', error);
                toast.error('Failed to delete comment');
            }
        }
    };

    // Handle editing a comment
    const handleEditComment = async (commentId) => {
        if (!editText.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        try {
            await updateDoc(doc(db, 'comments', commentId), {
                text: editText.trim(),
                updatedAt: serverTimestamp()
            });

            setEditingCommentId(null);
            setEditText('');
            toast.success('Comment updated successfully!');
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Failed to update comment');
        }
    };

    // Handle adding a reply
    const handleAddReply = async (e, parentId) => {
        e.preventDefault();

        if (!replyText.trim()) {
            toast.warning('Please enter a reply');
            return;
        }

        if (!currentUser) {
            toast.error('Please login to reply');
            return;
        }

        try {
            await addDoc(collection(db, 'comments'), {
                postId,
                parentId,
                text: replyText.trim(),
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setReplyingTo(null);
            setReplyText('');
            toast.success('Reply added successfully!');
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
        }
    };

    // Handle toggling like
    const handleToggleLike = async (commentId) => {
        if (!currentUser) {
            toast.error('Please login to like comments');
            return;
        }

        const likeRef = doc(db, 'comments', commentId, 'likes', currentUser.uid);
        const isLiked = likes[commentId]?.liked;

        try {
            if (isLiked) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, {
                    userId: currentUser.uid,
                    createdAt: serverTimestamp()
                });
            }

            // Update local state
            setLikes(prev => ({
                ...prev,
                [commentId]: {
                    count: isLiked ? prev[commentId].count - 1 : prev[commentId].count + 1,
                    liked: !isLiked
                }
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to toggle like');
        }
    };

    // Start editing a comment
    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditText(comment.text);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditText('');
    };

    // Format relative time
    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Comment Form */}
            <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleAddComment} className="flex gap-3">
                    <div className="flex-shrink-0">
                        {currentUser?.photoURL ? (
                            <img 
                                src={currentUser.photoURL} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={currentUser ? "Add a comment..." : "Login to comment"}
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                            disabled={!currentUser}
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={!currentUser || submitting || !newComment.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaPaperPlane />
                                {submitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="divide-y divide-gray-200">
                {comments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FaComment className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments
                        .filter(comment => !comment.parentId) // Only top-level comments
                        .map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                allComments={comments}
                                editingCommentId={editingCommentId}
                                editText={editText}
                                setEditText={setEditText}
                                handleEditComment={handleEditComment}
                                handleDeleteComment={handleDeleteComment}
                                startEditing={startEditing}
                                cancelEditing={cancelEditing}
                                formatRelativeTime={formatRelativeTime}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                handleAddReply={handleAddReply}
                                handleToggleLike={handleToggleLike}
                                likes={likes}
                                currentUser={currentUser}
                            />
                        ))
                )}
            </div>
        </div>
    );
};

const CommentItem = ({
    comment,
    allComments,
    editingCommentId,
    editText,
    setEditText,
    handleEditComment,
    handleDeleteComment,
    startEditing,
    cancelEditing,
    formatRelativeTime,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleAddReply,
    handleToggleLike,
    likes,
    currentUser
}) => {
    const replies = allComments.filter(c => c.parentId === comment.id);

    return (
        <div className="p-4">
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    {comment.userPhoto ? (
                        <img
                            src={comment.userPhoto}
                            alt={comment.userName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <FaUserCircle className="w-8 h-8 text-gray-400" />
                    )}
                </div>
                <div className="flex-grow">
                    {editingCommentId === comment.id ? (
                        <div>
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => handleEditComment(comment.id)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    <FaCheck /> Save
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-gray-800">
                                        {comment.userName}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {formatRelativeTime(comment.createdAt)}
                                    </span>
                                </div>
                                {currentUser && currentUser.uid === comment.userId && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditing(comment)}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Edit comment"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete comment"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                {comment.text}
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                                <button
                                    onClick={() => handleToggleLike(comment.id)}
                                    className={`flex items-center gap-1 text-sm ${
                                        likes[comment.id]?.liked ? 'text-red-500' : 'text-gray-500'
                                    } hover:text-red-500`}
                                >
                                    {likes[comment.id]?.liked ? <FaHeart /> : <FaRegHeart />}
                                    {likes[comment.id]?.count || 0}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
                                >
                                    <FaReply /> Reply
                                </button>
                            </div>
                            {replyingTo === comment.id && (
                                <form onSubmit={(e) => handleAddReply(e, comment.id)} className="mt-3 ml-8">
                                    <div className="flex gap-2">
                                        <div className="flex-shrink-0">
                                            {currentUser?.photoURL ? (
                                                <img
                                                    src={currentUser.photoURL}
                                                    alt="Profile"
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaUserCircle className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                                rows="2"
                                            />
                                            <div className="mt-2 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setReplyingTo(null)}
                                                    className="px-3 py-1 text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Render replies */}
            {replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            editingCommentId={editingCommentId}
                            editText={editText}
                            setEditText={setEditText}
                            handleEditComment={handleEditComment}
                            handleDeleteComment={handleDeleteComment}
                            startEditing={startEditing}
                            cancelEditing={cancelEditing}
                            formatRelativeTime={formatRelativeTime}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleAddReply={handleAddReply}
                            handleToggleLike={handleToggleLike}
                            likes={likes}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;
