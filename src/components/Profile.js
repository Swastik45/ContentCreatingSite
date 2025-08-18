import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import { 
    FaCamera, 
    FaEdit, 
    FaSave, 
    FaUserCircle,
    FaLock,
    FaEnvelope
} from 'react-icons/fa';

const Profile = () => {
    // Default Cloudinary profile picture URL
    const defaultProfilePic = "https://res.cloudinary.com/dkiwvr6ml/image/upload/v1709536678/default-profile-pic_qjqydy.png";

    const [user, setUser ] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        firstName: '',
        lastName: '',
        bio: '',
        profilePic: defaultProfilePic,
    });

    const [originalData, setOriginalData] = useState({}); // New state for original data

    // New state for password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(defaultProfilePic);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            toast.error('Failed to upload profile picture.');
            return null;
        }
    };

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser  = auth.currentUser ;
            if (currentUser ) {
                try {
                    const userDoc = doc(db, "users", currentUser .uid);
                    const docSnap = await getDoc(userDoc);
                    
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser (currentUser );
                        setFormData({
                            userName: userData.username || '',
                            email: currentUser .email || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            bio: userData.bio || '',
                            profilePic: userData.profilePic || defaultProfilePic,
                        });
                        
                        // Store original data
                        setOriginalData({
                            userName: userData.username || '',
                            email: currentUser .email || '',
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            bio: userData.bio || '',
                        });

                        // Set preview image
                        setPreviewImage(userData.profilePic || defaultProfilePic);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast.error("Failed to load user data");
                }
            }
        };

        fetchUserData();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    // Handle profile picture change
    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true )// Upload to Cloudinary
                const uploadedImageUrl = await handleImageUpload(file);
                
                if (uploadedImageUrl) {
                    // Update Firestore document
                    const userDoc = doc(db, "users", user.uid);
                    await updateDoc(userDoc, { 
                        profilePic: uploadedImageUrl 
                    });

                    // Update Auth profile
                    await updateProfile(user, { 
                        photoURL: uploadedImageUrl 
                    });

                    // Update local state
                    setFormData(prev => ({ 
                        ...prev, 
                        profilePic: uploadedImageUrl 
                    }));
                    setPreviewImage(uploadedImageUrl);
                    
                    toast.success("Profile picture updated successfully");
                }
            } catch (error) {
                console.error("Profile pic upload error:", error);
                toast.error("Failed to upload profile picture");
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Save profile changes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Check if there are any changes
        const hasChanges = 
            formData.userName !== originalData.userName ||
            formData.email !== originalData.email ||
            formData.firstName !== originalData.firstName ||
            formData.lastName !== originalData.lastName ||
            formData.bio !== originalData.bio;

        if (!hasChanges) {
            setSuccess("No changes detected.");
            setIsLoading(false);
            return; // Exit if no changes
        }

        try {
            // Update Firestore document
            const userDoc = doc(db, "users", user.uid);
            await updateDoc(userDoc, {
                username: formData.userName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
            });

            // Update Auth profile
            await updateProfile(user, {
                displayName: formData.userName
            });

            // Update email if changed
            if (formData.email !== user.email) {
                await updateEmail(user, formData.email);
            }

            setSuccess("Profile updated successfully");
            setIsEditing(false);
            setIsLoading(false);
        } catch (error) {
            console.error("Update Error:", error);
            setError(error.message || "Failed to update profile");
            setIsLoading(false);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validate password
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            // Here you would typically re-authenticate the user before changing password
            // For simplicity, this is omitted, but in a real app, you should use 
            // reauthenticateWithCredential from Firebase

            await updatePassword(user, passwordData.newPassword);

            setSuccess("Password updated successfully");
            setIsPasswordEditing(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Password Update Error:", error);
            setError(error.message || "Failed to update password");
            setIsLoading(false);
        }
    };

    // Render profile picture
    const renderProfilePicture = () => {
        return (
            <div className="relative w-40 h-40 mx-auto mb-6 group">
                <img
                    src={previewImage || defaultProfilePic}
                    alt="Profile"
                    width="256"
                    height="256"
                    loading="lazy"
                    className="w-full h-full rounded-full object-cover border-4 border-blue-500 transition-all group-hover:opacity-70"
                />
                <label 
                    htmlFor="profilePicInput" className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <FaCamera className="text-white text-2xl" />
                </label>
                <input 
                    type="file" 
                    id="profilePicInput" 
                    accept="image/*" 
                    onChange={handleProfilePicChange} 
                    className="hidden" 
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Profile</h2>

                {error && (
                    <div className=" bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {renderProfilePicture()}

                <form onSubmit={isEditing ? handleSubmit : handlePasswordSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="userName"
                            placeholder="Username"
                            value={formData.userName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <textarea
                            name="bio"
                            placeholder="Bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            disabled={!isEditing}
                        />
                    </div>

                    {isEditing ? (
                        <button 
                            type="submit" 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            <FaSave className="inline mr-2" /> Save Changes
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(true)} 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            <FaEdit className="inline mr-2" /> Edit Profile
                        </button>
                    )}
                </form>

                <div className="mt-6">
                    <button 
                        onClick={() => setIsPasswordEditing(!isPasswordEditing)} 
                        className="text-blue-500 hover:underline"
                    >
                        {isPasswordEditing ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {isPasswordEditing && (
                    <form onSubmit={handlePasswordSubmit} className="mt-4">
                        <div className="mb-4">
                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            <FaLock className="inline mr-2" /> Change Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;