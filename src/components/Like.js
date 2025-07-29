import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    getDoc 
} from 'firebase/firestore';
import { 
    FaHeart, 
    FaRegHeart, 
    FaThumbsUp, 
    FaThumbsDown 
} from 'react-icons/fa';

const Like = ({ postId, type = 'like' }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!auth.currentUser) return;

            try {
                const postRef = doc(db, "content", postId);
                const postDoc = await getDoc(postRef);
                
                if (postDoc.exists()) {
                    const likes = postDoc.data().likes || [];
                    setLiked(likes.includes(auth.currentUser.uid));
                    setLikeCount(likes.length);
                }
            } catch (error) {
                console.error("Error checking like status: ", error);
            }
        };

        checkLikeStatus();
    }, [postId]);

    const handleLike = async () => {
        if (!auth.currentUser) {
            alert("You must be logged in to like a post.");
            return;
        }

        try {
            const postRef = doc(db, "content", postId);
            
            if (liked) {
                // Unlike the post
                await updateDoc(postRef, {
                    likes: arrayRemove(auth.currentUser.uid)
                });
                setLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // Like the post
                await updateDoc(postRef, {
                    likes: arrayUnion(auth.currentUser.uid)
                });
                setLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error liking/unliking post: ", error);
        }
    };

    // Render different icons based on type
    const renderIcon = () => {
        switch(type) {
            case 'thumbs':
                return liked ? <FaThumbsUp className="text-blue-500" /> : <FaThumbsDown className="text-gray-500" />;
            case 'heart':
                return liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500" />;
            default:
                return liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500" />;
        }
    };

    return (
        <div 
            className="flex items-center cursor-pointer select-none"
            onClick={handleLike}
        >
            <span className="mr-2">{renderIcon()}</span>
            {likeCount > 0 && (
                <span className={`text-sm ${liked ? 'text-red-500' : 'text-gray-500'}`}>
                    {likeCount}
                </span>
            )}
        </div>
    );
};

export default Like;