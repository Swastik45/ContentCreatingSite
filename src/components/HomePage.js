import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaEdit, 
    FaTrash, 
    FaEye, 
    FaHeart, 
    FaComment, 
    FaCalendarAlt, 
    FaCamera,
    FaSearch,
    FaFilter,
    FaSpinner,
    FaRocket,
    FaStar,
    FaPlay,
    FaUserPlus
} from 'react-icons/fa';
import { 
    Code, 
    Server, 
    Smartphone, 
    Github, 
    Linkedin, 
    Mail, 
    ArrowUp, 
    ExternalLink,
    Eye,
    Rocket,
    Star,
    Heart,
    Calendar,
    Camera,
    Play,
    Zap,
    Users,
    TrendingUp
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit,
    where
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch featured posts
    const fetchFeaturedPosts = useCallback(async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "content"),
                orderBy("createdAt", "desc"),
                limit(6)
            );

            const querySnapshot = await getDocs(q);
            const posts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            setFeaturedPosts(posts);
            setError('');
        } catch (error) {
            console.error("Error fetching featured posts:", error);
            setError("Failed to load featured content");
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeaturedPosts();
    }, [fetchFeaturedPosts]);

    // Hero Section
    const HeroSection = () => (
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative container mx-auto px-4 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                            Content Creator Hub
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        Create, share, and discover amazing content. 
                        Join a community of creators who are shaping the future of digital storytelling.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/create-content')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <FaRocket className="inline mr-2" />
                            Start Creating
                        </button>
                        <button
                            onClick={() => navigate('/public-content')}
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            <FaEye className="inline mr-2" />
                            Explore Content
                        </button>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse delay-1000"></div>
            </div>
        </section>
    );

    // Features Section
    const FeaturesSection = () => (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Why Choose Our Platform?
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Everything you need to create, share, and grow your content
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <FaRocket className="w-8 h-8 text-blue-500" />,
                            title: "Easy Creation",
                            description: "Create stunning content with our intuitive editor and powerful tools."
                        },
                        {
                            icon: <FaEye className="w-8 h-8 text-green-500" />,
                            title: "Wide Reach",
                            description: "Share your content with a global audience and build your following."
                        },
                        {
                            icon: <FaHeart className="w-8 h-8 text-red-500" />,
                            title: "Community Support",
                            description: "Get feedback, support, and grow with our active creator community."
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 mx-auto">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-center">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    // CTA Section
    const CTASection = () => (
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Ready to Start Creating?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                    Join thousands of creators who are already sharing their stories with the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/create-content')}
                        className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        <FaRocket className="inline mr-2" />
                        Start Creating
                    </button>
                    <button
                        onClick={() => navigate('/auth')}
                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                    >
                        <FaUserPlus className="inline mr-2" />
                        Join Now
                    </button>
                </div>
            </div>
        </section>
    );

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">Loading homepage...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <FeaturesSection />
            <CTASection />
        </div>
    );
};

export default HomePage;
