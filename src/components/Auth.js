import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile 
} from 'firebase/auth';
import { 
    setDoc, 
    doc 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '', 
        password: '', 
        username: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        setError('');
    };

    // Handle User Signup
    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Validate input fields
        if (!formData.email || !formData.password || !formData.username) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            const user = userCredential.user;

            // Update user profile with username
            await updateProfile(user, {
                displayName: formData.username
            });

            // Create user document in Firestore
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, {
                username: formData.username,
                email: formData.email,
                firstName: formData.firstName || '',
                lastName: formData.lastName || '',
                createdAt: new Date()
            });

            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            console.error("Signup Error:", error);
            setError(handleFirebaseError(error));
        }
    };

    // Handle User Login
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validate input fields
        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            return;
        }

        try {
            await signInWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );
            
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            console.error("Login Error:", error);
            setError(handleFirebaseError(error));
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged out successfully');
            navigate('/auth');
        } catch (error) {
            console.error("Logout Error:", error);
            toast.error('Failed to log out');
        }
    };

    // Firebase Error Handler
    const handleFirebaseError = (error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'Email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/user-not-found':
                return 'No user found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            default:
                return error.message || 'Authentication failed';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {isLogin ? 'Login' : 'Sign Up'}
                </h2>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleSignup}>
                    {/* Username Field (for Signup) */}
                    {!isLogin && (
                        <div className="mb-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {/* Optional: First and Last Name for Signup */}
                    {!isLogin && (
                        <div className="mb-4 flex space-x-2">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-1/2 p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-1/2 p-2 border rounded"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>

                    {/* Toggle Between Login and Signup */}
                    <div className="text-center mt-4">
                        <button 
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-500 hover:underline"
                        >
                            {isLogin 
                                ? 'Need an account? Sign Up' 
                                : 'Already have an account? Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;