import React, { Suspense, lazy } from 'react';
import { 
    BrowserRouter as Router, 
    Route, 
    Routes, 
    Navigate 
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import { auth } from './firebase';

// Lazy load all major pages
const HomePage = lazy(() => import('./components/HomePage'));
const MyContent = lazy(() => import('./components/MyContent'));
const PublicContent = lazy(() => import('./components/PublicContent'));
const Auth = lazy(() => import('./components/Auth'));
const CreateContent = lazy(() => import('./components/CreateContent'));
const Profile = lazy(() => import('./components/Profile'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = auth.currentUser ;
    return user ? children : <Navigate to="/auth" replace />;
};

const App = () => (
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
                <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/auth" element={<Auth />} />
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
                </Suspense>
            </main>
        </div>
    </Router>
);

export default App;