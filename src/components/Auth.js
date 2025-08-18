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
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '', 
        password: '', 
        username: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
        if (e && e.preventDefault) e.preventDefault();
        setIsLoading(true);
        
        // Validate input fields
        if (!formData.email || !formData.password || !formData.username) {
            setError('Please fill in all required fields');
            setIsLoading(false);
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
            setIsLoading(false);
        } catch (error) {
            console.error("Signup Error:", error);
            setError(handleFirebaseError(error));
            setIsLoading(false);
        }
    };

    // Handle User Login
    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsLoading(true);
        
        // Validate input fields
        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            setIsLoading(false);
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
            setIsLoading(false);
        } catch (error) {
            console.error("Login Error:", error);
            setError(handleFirebaseError(error));
            setIsLoading(false);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative bg-white bg-opacity-10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white border-opacity-20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                        {isLogin ? (
                            <LogIn className="w-8 h-8 text-white" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-white text-opacity-70">
                        {isLogin 
                            ? 'Sign in to your account to continue' 
                            : 'Join us today and get started'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm text-red-100 p-4 rounded-2xl mb-6 border border-red-500 border-opacity-30 animate-pulse">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {error}
                        </div>
                    </div>
                )}

                <div className="space-y-5">
                    {/* Username Field (for Signup) */}
                    {!isLogin && (
                        <div className="group">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-blue-400 focus:border-opacity-50 transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="group">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-blue-400 focus:border-opacity-50 transition-all duration-300"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="group">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-blue-400 focus:border-opacity-50 transition-all duration-300"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* First and Last Name for Signup */}
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-blue-400 focus:border-opacity-50 transition-all duration-300"
                                />
                            </div>
                            <div className="group">
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-blue-400 focus:border-opacity-50 transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="button" 
                        disabled={isLoading}
                        onClick={isLogin ? handleLogin : handleSignup}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
                        style={{
                            transform: isLoading ? 'none' : undefined
                        }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mr-3"></div>
                                {isLogin ? 'Signing In...' : 'Creating Account...'}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                {isLogin ? (
                                    <LogIn className="w-5 h-5 mr-2" />
                                ) : (
                                    <UserPlus className="w-5 h-5 mr-2" />
                                )}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </div>
                        )}
                    </button>

                    {/* Toggle Between Login and Signup */}
                    <div className="text-center pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white text-opacity-80 hover:text-white transition-colors duration-300 font-medium"
                        >
                            {isLogin 
                                ? "Don't have an account? " 
                                : 'Already have an account? '}
                            <span className="text-blue-400 hover:text-blue-300 underline">
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-500 from-opacity-20 to-purple-600 to-opacity-20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-pink-500 from-opacity-20 to-blue-500 to-opacity-20 rounded-full blur-xl"></div>
            </div>
        </div>
    );
};

export default Auth;