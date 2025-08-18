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

    // Define your brand color here - you can easily change this
    const brandColor = '#3b82f6'; // Blue color, change to your preferred color
    const brandColorHover = '#2563eb'; // Darker blue for hover states

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setIsAuthenticated(true);
                setUsername(user.displayName || user.email || 'User');
            } else {
                setIsAuthenticated(false);
                setUsername('');
            }
        });
        return () => unsubscribe();
    }, []);

    // Close mobile menu when clicking outside or on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when mobile menu is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/auth');
            setIsOpen(false); // Close mobile menu after logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { icon: <FaHome />, text: 'Home', path: '/', show: true },
        { icon: <FaGlobe />, text: 'Public Content', path: '/public-content', show: true },
        { icon: <FaList />, text: 'My Content', path: '/my-content', show: isAuthenticated },
        { icon: <FaPlus />, text: 'Create Content', path: '/create-content', show: isAuthenticated }
    ];

    const isActivePath = (path) => location.pathname === path;

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/80 shadow-lg border-b border-white/10">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-xl sm:text-2xl md:text-3xl font-bold text-white transition duration-300"
                        style={{ 
                            color: isActivePath('/') ? brandColor : '#ffffff'
                        }}
                        onMouseEnter={(e) => e.target.style.color = brandColor}
                        onMouseLeave={(e) => e.target.style.color = isActivePath('/') ? brandColor : '#ffffff'}
                    >
                        Content Platform
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {menuItems.map((item, idx) => item.show && (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105 ${
                                    isActivePath(item.path) 
                                        ? 'font-semibold shadow-lg' 
                                        : 'font-normal hover:bg-white/10'
                                }`}
                                style={{
                                    backgroundColor: isActivePath(item.path) ? `${brandColor}20` : 'transparent',
                                    color: isActivePath(item.path) ? brandColor : '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActivePath(item.path)) {
                                        e.target.style.color = brandColor;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath(item.path)) {
                                        e.target.style.color = '#ffffff';
                                    }
                                }}
                            >
                                {item.icon}
                                <span>{item.text}</span>
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/20">
                                <Link 
                                    to="/profile" 
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all duration-300 ${
                                        isActivePath('/profile') ? 'font-semibold' : 'hover:bg-white/10'
                                    }`}
                                    style={{
                                        backgroundColor: isActivePath('/profile') ? `${brandColor}20` : 'transparent',
                                        color: isActivePath('/profile') ? brandColor : '#ffffff'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActivePath('/profile')) {
                                            e.target.style.color = brandColor;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActivePath('/profile')) {
                                            e.target.style.color = '#ffffff';
                                        }
                                    }}
                                >
                                    <FaUser />
                                    <span className="max-w-32 truncate">{username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                                >
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className={`ml-6 pl-6 border-l border-white/20 flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all duration-300 ${
                                    isActivePath('/auth') ? 'font-semibold' : 'hover:bg-white/10'
                                }`}
                                style={{
                                    backgroundColor: isActivePath('/auth') ? `${brandColor}20` : 'transparent',
                                    color: isActivePath('/auth') ? brandColor : '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActivePath('/auth')) {
                                        e.target.style.color = brandColor;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActivePath('/auth')) {
                                        e.target.style.color = '#ffffff';
                                    }
                                }}
                            >
                                <FaSignInAlt />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="mobile-toggle text-white focus:outline-none transition-all duration-150 hover:scale-105 p-2 rounded-lg hover:bg-white/10 active:scale-95"
                            style={{
                                color: isOpen ? brandColor : '#ffffff'
                            }}
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isOpen}
                        >
                            <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-200 ease-out ${
                                    isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
                                }`} />
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-200 ease-out ${
                                    isOpen ? 'opacity-0' : 'opacity-100'
                                }`} />
                                <span className={`block h-0.5 w-6 bg-current transition-all duration-200 ease-out ${
                                    isOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1.5'
                                }`} />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ease-out ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900/95 backdrop-blur-md z-50 transform transition-transform duration-200 ease-out border-l border-white/10 mobile-menu ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                        <button
                            onClick={toggleMenu}
                            className="text-white hover:text-red-400 transition-colors duration-150 p-2 hover:bg-white/10 rounded-lg active:scale-95"
                            aria-label="Close menu"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Mobile Menu Items */}
                    <div className="flex-1 overflow-y-auto py-6">
                        <div className="space-y-2 px-4">
                            {menuItems.map((item, idx) => item.show && (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    onClick={toggleMenu}
                                    className={`flex items-center space-x-4 px-6 py-4 text-white rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] ${
                                        isActivePath(item.path) 
                                            ? 'font-bold' 
                                            : 'hover:bg-white/10'
                                    }`}
                                    style={{
                                        backgroundColor: isActivePath(item.path) ? `${brandColor}20` : 'transparent',
                                        color: isActivePath(item.path) ? brandColor : '#ffffff'
                                    }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-lg">{item.text}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Menu Footer */}
                        <div className="mt-8 pt-6 border-t border-white/10 px-4">
                            {isAuthenticated ? (
                                <div className="space-y-2">
                                    <Link 
                                        to="/profile" 
                                        onClick={toggleMenu} 
                                        className={`flex items-center space-x-4 px-6 py-4 text-white rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] ${
                                            isActivePath('/profile') ? 'font-bold' : 'hover:bg-white/10'
                                        }`}
                                        style={{
                                            backgroundColor: isActivePath('/profile') ? `${brandColor}20` : 'transparent',
                                            color: isActivePath('/profile') ? brandColor : '#ffffff'
                                        }}
                                    >
                                        <FaUser className="text-lg" />
                                        <span className="text-lg truncate">{username}</span>
                                    </Link>
                                    <button 
                                        onClick={() => { handleLogout(); toggleMenu(); }} 
                                        className="w-full flex items-center space-x-4 px-6 py-4 text-white rounded-xl transition-all duration-150 hover:text-red-400 hover:bg-red-500/10 hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        <FaSignOutAlt className="text-lg" />
                                        <span className="text-lg">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to="/auth" 
                                    onClick={toggleMenu} 
                                    className={`flex items-center space-x-4 px-6 py-4 text-white rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] ${
                                        isActivePath('/auth') ? 'font-bold' : 'hover:bg-white/10'
                                    }`}
                                    style={{
                                        backgroundColor: isActivePath('/auth') ? `${brandColor}20` : 'transparent',
                                        color: isActivePath('/auth') ? brandColor : '#ffffff'
                                    }}
                                >
                                    <FaSignInAlt className="text-lg" />
                                    <span className="text-lg">Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;