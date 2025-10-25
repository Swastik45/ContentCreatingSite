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
    const [scrolled, setScrolled] = useState(false);
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

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            <nav 
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'backdrop-blur-xl bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 shadow-2xl' 
                        : 'backdrop-blur-md bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90'
                } border-b border-white/5`}
                style={{
                    boxShadow: scrolled ? '0 10px 40px -10px rgba(59, 130, 246, 0.3)' : 'none'
                }}
            >
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    
                    {/* Logo */}
                    <Link
                        to="/"
                        className="relative text-xl sm:text-2xl md:text-3xl font-black tracking-tight group"
                    >
                        <span 
                            className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-300 group-hover:via-blue-400 group-hover:to-purple-400"
                        >
                            Content Platform
                        </span>
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {menuItems.map((item, idx) => item.show && (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                                    isActivePath(item.path) 
                                        ? 'text-white font-semibold' 
                                        : 'text-gray-300 font-medium hover:text-white'
                                }`}
                            >
                                {isActivePath(item.path) && (
                                    <div 
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                                        style={{
                                            boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.3)'
                                        }}
                                    />
                                )}
                                {!isActivePath(item.path) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
                                )}
                                <span className={`relative z-10 transition-transform duration-300 ${isActivePath(item.path) ? 'text-blue-400' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="relative z-10">{item.text}</span>
                                {isActivePath(item.path) && (
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                                )}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/10">
                                <Link 
                                    to="/profile" 
                                    className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                                        isActivePath('/profile') 
                                            ? 'text-white font-semibold' 
                                            : 'text-gray-300 font-medium hover:text-white'
                                    }`}
                                >
                                    {isActivePath('/profile') && (
                                        <div 
                                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                                            style={{
                                                boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.3)'
                                            }}
                                        />
                                    )}
                                    {!isActivePath('/profile') && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
                                    )}
                                    <span className={`relative z-10 transition-transform duration-300 ${isActivePath('/profile') ? 'text-blue-400' : 'group-hover:scale-110'}`}>
                                        <FaUser />
                                    </span>
                                    <span className="relative z-10 max-w-32 truncate">{username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="relative flex items-center space-x-2 px-5 py-2.5 rounded-xl text-gray-300 font-medium transition-all duration-300 group overflow-hidden hover:text-white"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-300" />
                                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400">
                                        <FaSignOutAlt />
                                    </span>
                                    <span className="relative z-10 group-hover:text-red-400">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className={`relative ml-4 pl-4 border-l border-white/10 flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden font-medium ${
                                    isActivePath('/auth') ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>
                                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl transition-opacity duration-300 ${
                                    isActivePath('/auth') ? 'opacity-100' : 'opacity-0'
                                }`}></div>
                                <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <FaSignInAlt />
                                </span>
                                <span className="relative z-10">Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="relative p-3 rounded-xl transition-all duration-300 group overflow-hidden"
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isOpen}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block h-0.5 w-6 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out ${
                                    isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
                                }`} />
                                <span className={`block h-0.5 w-6 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out ${
                                    isOpen ? 'opacity-0' : 'opacity-100'
                                }`} />
                                <span className={`block h-0.5 w-6 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out ${
                                    isOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1.5'
                                }`} />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-all duration-300 ease-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 backdrop-blur-xl border-l border-white/10 shadow-2xl shadow-blue-500/20">
                    <div className="flex flex-col h-full">
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Menu</h2>
                            <button
                                onClick={toggleMenu}
                                className="relative p-2 rounded-lg transition-all duration-300 group overflow-hidden"
                                aria-label="Close menu"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                                <FaTimes size={18} className="relative z-10 text-gray-300 group-hover:text-red-400 transition-colors duration-300" />
                            </button>
                        </div>

                        {/* Mobile Menu Items */}
                        <div className="flex-1 overflow-y-auto py-6">
                            <div className="space-y-1 px-4">
                                {menuItems.map((item, idx) => item.show && (
                                    <Link
                                        key={idx}
                                        to={item.path}
                                        onClick={toggleMenu}
                                        className={`relative flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-300 group overflow-hidden ${
                                            isActivePath(item.path) 
                                                ? 'text-white font-bold' 
                                                : 'text-gray-300 font-medium hover:text-white'
                                        }`}
                                    >
                                        {isActivePath(item.path) && (
                                            <div 
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                                                style={{
                                                    boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.3)'
                                                }}
                                            />
                                        )}
                                        {!isActivePath(item.path) && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
                                        )}
                                        <span className={`relative z-10 text-lg transition-transform duration-300 ${
                                            isActivePath(item.path) ? 'text-blue-400' : 'group-hover:scale-110'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        <span className="relative z-10 text-lg">{item.text}</span>
                                        {isActivePath(item.path) && (
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Mobile Menu Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10 px-4">
                                {isAuthenticated ? (
                                    <div className="space-y-1">
                                        <Link 
                                            to="/profile" 
                                            onClick={toggleMenu} 
                                            className={`relative flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-300 group overflow-hidden ${
                                                isActivePath('/profile') 
                                                    ? 'text-white font-bold' 
                                                    : 'text-gray-300 font-medium hover:text-white'
                                            }`}
                                        >
                                            {isActivePath('/profile') && (
                                                <div 
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                                                    style={{
                                                        boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.3)'
                                                    }}
                                                />
                                            )}
                                            {!isActivePath('/profile') && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
                                            )}
                                            <span className={`relative z-10 text-lg transition-transform duration-300 ${
                                                isActivePath('/profile') ? 'text-blue-400' : 'group-hover:scale-110'
                                            }`}>
                                                <FaUser />
                                            </span>
                                            <span className="relative z-10 text-lg truncate">{username}</span>
                                        </Link>
                                        <button 
                                            onClick={() => { handleLogout(); toggleMenu(); }} 
                                            className="relative w-full flex items-center space-x-4 px-6 py-4 rounded-xl text-gray-300 font-medium transition-all duration-300 group overflow-hidden hover:text-white"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-300" />
                                            <span className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400">
                                                <FaSignOutAlt />
                                            </span>
                                            <span className="relative z-10 text-lg group-hover:text-red-400">Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <Link 
                                        to="/auth" 
                                        onClick={toggleMenu} 
                                        className={`relative flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-300 group overflow-hidden ${
                                            isActivePath('/auth') 
                                                ? 'text-white font-bold' 
                                                : 'text-gray-300 font-medium hover:text-white'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>
                                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl transition-opacity duration-300 ${
                                            isActivePath('/auth') ? 'opacity-100' : 'opacity-0'
                                        }`}></div>
                                        <span className="relative z-10 text-lg transition-transform duration-300 group-hover:scale-110">
                                            <FaSignInAlt />
                                        </span>
                                        <span className="relative z-10 text-lg">Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;