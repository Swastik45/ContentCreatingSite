import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc, 
    deleteDoc,
    updateDoc,
    orderBy
} from 'firebase/firestore';
import { 
    FaTrash, 
    FaReply, 
    FaHeart,
    FaRegHeart
} from 'react-icons/fa';


const CommentItem = ({ 
    comment, 
    currentUser, 
    onReply, 
    onDelete, 
    onLike, 
    likeInfo 
}) => {
    return (
        <div className="bg-gray-100 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-sm">{comment.username}</h4>
                    <p className="text-gray-700">{comment.body}</p>
                </div>
                
                {currentUser && (
                    <div className="flex items-center space-x-2">
                        {/* Like Button */}
                        <button 
                            onClick={() => onLike(comment.id)} 
                            className="flex items-center text-sm"
                        >
                            {likeInfo.liked ? (
                                <FaHeart className="text-red-500 mr-1" />
                            ) : (
                                <FaRegHeart className="text-gray-500 mr-1" />
                            )}
                            <span>{likeInfo.count}</span>
                        </button>

                        {/* Reply Button */}
                        <button 
                            onClick={() => onReply(comment)} 
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <FaReply />
                        </button>

                        {/* Delete Button (only for comment owner) */}
                        {comment.creatorId === currentUser.uid && (
                            <button 
                                onClick={() => onDelete(comment.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Comment Component
const Comment = ({ postId }) => {
    // State Management
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [likes, setLikes] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Current User
    const currentUser = auth.currentUser;

    // Fetch Comments
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
                querySnapshot.docs.map(async (docSnapshot) => {
                    const commentData = { 
                        id: docSnapshot.id, 
                        ...docSnapshot.data() 
                    };
                    
                    // Fetch username
                    const userDoc = doc(db, "users", commentData.creatorId);
                    const userSnapshot = await getDoc(userDoc);
                    commentData.username = userSnapshot.exists() 
                        ? userSnapshot.data().username 
                        : 'Anonymous';
                    
                    return commentData;
                })
            );

            // Initialize likes
            const commentLikes = {};
            fetchedComments.forEach(comment => {
                commentLikes[comment.id] = {
                    count: comment.likes?.length || 0,
                    liked: comment.likes?.includes(currentUser?.uid) || false
                };
            });

            setComments(fetchedComments);
            setLikes(commentLikes);
        } catch (err) {
            setError('Failed to fetch comments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial Comments Fetch
    useEffect(() => {
        fetchComments();
    }, [postId]);

    // Add Comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError('Please log in to comment');
            return;
        }

        try {
            const commentData = {
                postId,
                body: newComment,
                creatorId: currentUser.uid,
                createdAt: new Date(),
                parentCommentId: replyingTo?.id || null,
                likes: []
            };

            const docRef = await addDoc(collection(db, "comments"), commentData);
            
            // Refresh comments
            await fetchComments();
            
            // Reset form
            setNewComment('');
            setReplyingTo(null);
        } catch (err) {
            setError('Failed to add comment');
            console.error(err);
        }
    };

    // Like Comment
    const handleLikeComment = async (commentId) => {
        if (!currentUser) {
            setError('Please log in to like');
            return;
        }

        try {
            const commentRef = doc(db, "comments", commentId);
            const commentSnapshot = await getDoc(commentRef);
            const currentLikes = commentSnapshot.data().likes || [];

            const userId = currentUser.uid;
            const updatedLikes = currentLikes.includes(userId)
                ? currentLikes.filter(id => id !== userId)
                : [...currentLikes, userId];

            await updateDoc(commentRef, { likes: updatedLikes });
            
            // Refresh comments to update likes
            await fetchComments();
        } catch (err) {
            setError('Failed to like comment');
            console.error(err);
        }
    };

    // Delete Comment
    const handleDeleteComment = async (commentId) => {
        try {
            await deleteDoc(doc(db, "comments", commentId));
            await fetchComments();
        } catch (err) {
            setError('Failed to delete comment');
            console.error(err);
        }
    };

    return (
        <div className="comment-section p-4">
            {/* Error Display */}
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Comment Input */}
            {currentUser && (
                <form onSubmit={handleAddComment} className="mb-4">
                    {replyingTo && (
                        <div className="text-sm text-gray-600 mb-2">
                            Replying to: {replyingTo.username}
                            <button 
                                type="button" 
                                onClick={() => setReplyingTo(null)}
                                className="ml-2 text-red-500"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    <div className="flex">
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyingTo 
                                ? `Reply to ${replyingTo.username}` 
                                : "Add a comment..."
                            }
                            className="flex-grow p-2 border rounded-l"
                            required
                        />
                        <button 
                            type="submit" 
                            className="bg-blue-500 text -white rounded-r p-2"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            )}

            {/* Loading Indicator */}
            {loading && <div>Loading comments...</div>}

            {/* Comments List */}
            <div className="comments-list">
                {comments.map(comment => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        currentUser ={currentUser } 
                        onReply={setReplyingTo} 
                        onDelete={handleDeleteComment} 
                        onLike={handleLikeComment} 
                        likeInfo={likes[comment.id] || { count: 0, liked: false }} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Comment;