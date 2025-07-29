import React, { useState, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const CreateContent = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState(''); 
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const titleInputRef = useRef(null);

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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        // Handle image upload
        let imageUrl = null;
        if (image) {
            imageUrl = await handleImageUpload(image);
        }
    
        const processedTags = tags.split(',').map(tag => tag.trim());
    
        const contentData = {
            title: title.trim(),
            body: body.trim(),
            creatorId: auth.currentUser .uid,
            createdAt: serverTimestamp(),
            tags: processedTags,
            category: category || 'Other',
            image: imageUrl, // Use the uploaded image URL
            likes: [],
            comments: 0,
            views: 0,
        };
    
        try {
            // Add document to Firestore
            await addDoc(collection(db, "content"), contentData);
            toast.success('Content created successfully!');
            // Reset form fields
            setTitle('');
            setBody('');
            setTags('');
            setCategory('');
            setImage(null);
        } catch (error) {
            console.error("Error adding document: ", error);
            toast.error('Failed to create content.');
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Create New Content
            </h2>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
                {/* Title Input */}
                <div>
                    <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
                        Title
                    </label>
                    <input 
                        type="text" 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required 
                    />
                </div>

                {/* Content Body */}
                <div>
                    <label htmlFor="body" className="block text-gray-700 font-semibold mb-2">
                        Content
                    </label>
                    <textarea 
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your content here..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        required
                        maxLength={5000}
                    />
                </div>

                {/* Tags Input */}
                <div>
                    <label htmlFor="tags" className="block text-gray-700 font-semibold mb-2">
                        Tags (comma separated)
                    </label>
                    <input 
                        type="text" 
                        id="tags" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)} 
                        className 
                        ="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., tag1, tag2, tag3"
                    />
                </div>

                {/* Category Input */}
                <div>
                    <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">
                        Category
                    </label>
                    <input 
                        type="text" 
                        id="category" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                        Upload Image
                    </label>
                    <input 
                        type="file" 
                        id="image" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files[0])} 
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </div>

                {/* Submit Button */}
                <div>
                    <button 
                        type="submit" 
                        className={`w-full bg-blue-500 text-white font-semibold py-2 rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Create Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateContent;