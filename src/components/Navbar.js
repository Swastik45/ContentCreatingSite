import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
    FaHome,
    FaPlus,
    FaUser,
    FaSignOutAlt,
    FaSignInAlt,
    FaList,
    FaGlobe,
    FaBars,
    FaTimes
} from 'react-icons/fa';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Listen to authentication state
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsAuthenticated(true);
                // You might want to fetch username from Firestore here
                setUsername(user.displayName || user.email || 'User');
            } else {
                setIsAuthenticated(false);
                setUsername('');
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/auth');
            // Optional: Add a toast or notification
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Navigation menu items
    const menuItems = [
        {
            icon: <FaHome />,
            text: 'Home',
            path: '/',
            show: true
        },
        {
            icon: <FaGlobe />,
            text: 'Public Content',
            path: '/public-content',
            show: true
        },
        {
            icon: <FaList />,
            text: 'My Content',
            path: '/my-content',
            show: isAuthenticated
        },
        {
            icon: <FaPlus />,
            text: 'Create Content',
            path: '/create-content',
            show: isAuthenticated
        }
    ];

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg fixed top-0 left-0 w-full z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold text-white hover:text-gray-200 transition duration-300"
                    >
                        Content Platform
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Menu Items */}
                    {menuItems.map((item, index) => (
                        item.show && (
                            <Link
                                key={index}
                                to={item.path}
                                className={`flex items-center space-x-2 text-white hover:text-gray-200 transition duration-300 ${location.pathname === item.path
                                        ? 'font-bold underline'
                                        : 'font-normal'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.text}</span>
                            </Link>
                        )
                    ))}

                    {/* Authentication Actions */}
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-white">
                                <FaUser />
                                <Link to="/profile" className="hover:underline">
                                    <span>Profile</span>
                                </Link>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-white hover:text-red-300 transition duration-300"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="flex items-center space-x-2 text-white hover:text-gray-200 transition duration-300"
                        >
                            <FaSignInAlt />
                            <span>Login</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none"
                    >
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-700 absolute top-full left-0 w-full">
                    <div className="flex flex-col p-4 space-y-4">
                        {menuItems.map((item, index) => (
                            item.show && (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={toggleMenu}
                                    className={`flex items-center space-x-3 text-white hover:bg-blue-500/50 p-2 rounded transition duration-300 ${location.pathname === item.path
                                            ? 'bg-blue-500/50'
                                            : ''
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.text}</span>
                                </Link>
                            )
                        ))}

                        {/* Mobile Authentication Actions */}
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center space-x-3 text-white">
                                    <FaUser />
                                    <span>Profile</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 text-white hover:bg-red-500/50 p-2 rounded transition duration-300"
                                >
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                onClick={toggleMenu}
                                className="flex items-center space-x-3 text-white hover:bg-blue-500/50 p-2 rounded transition duration-300"
                            >
                                <FaSignInAlt />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;