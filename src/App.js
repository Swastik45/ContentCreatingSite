import React from 'react';
import { 
    BrowserRouter as Router, 
    Route, 
    Routes, 
    Navigate 
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MyContent from './components/MyContent';
import PublicContent from './components/PublicContent';
import Auth from './components/Auth';
import CreateContent from './components/CreateContent';
import Contact from './components/Contact';
import Profile from './components/Profile'; 
import { auth } from './firebase'; 

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = auth.currentUser ;
    return user ? children : <Navigate to="/auth" replace />;
};

const App = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                {/* ToastContainer for notifications */}
                <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                {/* Navbar - Fixed at the top */}
                <Navbar />

                {/* Main content area with dynamic padding to account for fixed navbar */}
                <main className="flex-grow mt-16">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/public-content" element={<PublicContent />} />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />

                        {/* Protected Routes */}
                        <Route 
                            path="/my-content" 
                            element={
                                <ProtectedRoute>
                                    <MyContent />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/create-content" 
                            element={
                                <ProtectedRoute>
                                    <CreateContent />
                                </ProtectedRoute>
                            } 
                        />

                        {/* 404 Route */}
                        <Route 
                            path="*" 
                            element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-4xl text-gray-600">
                                        404 - Page Not Found
                                    </h1>
                                </div>
                            } 
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;