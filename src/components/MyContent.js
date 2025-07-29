import React, { useState, useEffect } from 'react';
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
    FaCamera
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Comment from './Comment';
import Like from './Like';

const MyContent = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('recent');
    const [newImage, setNewImage] = useState(null);

    // Cloudinary image upload function
    const handleImageUpload = async (file) => {
        const url = `https://api.cloudinary.com/v1_1/dkiwvr6ml/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'Upload-Present');

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image.');
            return null;
        }
    };

    // Fetch posts
    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                const q = query(
                    collection(db, "content"), 
                    where("creatorId", "==", auth.currentUser.uid), 
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                
                const fetchedPosts = querySnapshot.docs.map(docSnapshot => ({
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                }));

                setPosts(fetchedPosts);
                setFilteredPosts(fetchedPosts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching my posts: ", error);
                toast.error("Failed to fetch content");
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, []);

    // Filter and Search Posts
    useEffect(() => {
        let result = [...posts];

        // Search filter
        if (searchTerm) {
            result = result.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.body.toLowerCase().includes(searchTerm.toLowerCase())
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
            default:
                result.sort((a, b) => b.createdAt - a.createdAt);
        }

        setFilteredPosts(result);
    }, [searchTerm, filterOption, posts]);

    // Delete Post Handler
    const handleDeletePost = async (postId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this post?");
            
            if (!confirmDelete) return;

            await deleteDoc(doc(db, "content", postId));
            setPosts(posts.filter(post => post.id !== postId));
            setOpenMenuId(null);
            toast.success("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post: ", error);
            toast.error("Failed to delete post");
        }
    };

    // Edit Post Handler
    const handleEditPost = async (e) => {
        e.preventDefault();
        
        try {
            if (!editingPost.title.trim() || !editingPost.body.trim()) {
                toast.error("Title and body cannot be empty");
                return;
            }

            // Handle image upload if a new image is selected
            let imageUrl = editingPost.image;
            if (newImage) {
                imageUrl = await handleImageUpload(newImage);
            }

            const postRef = doc(db, "content", editingPost.id);
            await updateDoc(postRef, {
                title: editingPost.title,
                body: editingPost.body,
                image: imageUrl
            });

            setPosts(posts.map(post => 
                post.id === editingPost.id 
                    ? { ...post, title: editingPost.title, body: editingPost.body, image: imageUrl } 
                    : post
            ));
            
            // Reset states
            setEditingPost(null);
            setNewImage(null);
            setOpenMenuId(null);
            
            toast.success("Post updated successfully!");
        } catch (error) {
            console.error("Error updating post: ", error);
            toast.error("Failed to update post");
        }
    };

    // Render Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">My Content</h1>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row justify-between mb-8 space-y-4 md:space-y-0">
                {/* Search Input */}
                <div className="relative flex-grow md:mr-4">
                    <input 
                        type="text"
                        placeholder="Search your posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select 
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="likes">Most Liked</option>
                        <option value="comments">Most Commented</option>
                    </select>
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                 
                </div>
            </div>

            {/* Posts List */}
            <ul className="space-y-6">
                {filteredPosts.map(post => (
                    <li key={post.id} className="bg-white border rounded-lg shadow-md p-4">
                        <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>
                        {post.image && <img src={post.image} alt={post.title} className="my-2 w-full h-auto rounded" />}
                        <p className="text-gray-700">{post.body}</p>
                        <div className="flex space-x-2 mt-4">
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                onClick={() => {
                                    setEditingPost({ id: post.id, title: post.title, body: post.body, image: post.image });
                                    setOpenMenuId(post.id);
                                }}
                            >
                                <FaEdit /> Edit
                            </button>
                            <button 
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                onClick={() => handleDeletePost(post.id)}
                            >
                                <FaTrash /> Delete
                            </button>
                        </div>
                        {openMenuId === post.id && (
                            <div className="mt-4">
                                <form onSubmit={handleEditPost}>
                                    <input 
                                        type="text" 
                                        className="border p-2 w-full mb-2 rounded" 
                                        value={editingPost?.title || ''} 
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} 
                                    />
                                    <textarea 
                                        className="border p-2 w-full mb-2 rounded" 
                                        value={editingPost?.body || ''} 
                                        onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })} 
                                    />
                                    <input 
                                        type="file" 
                                        className="border p-2 w-full mb-2 rounded" 
                                        onChange={(e) => setNewImage(e.target.files[0])} 
                                    />
                                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Save</button>
                                </form>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyContent;