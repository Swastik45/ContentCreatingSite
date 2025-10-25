import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    FaUserPlus,
    FaFire,
    FaTrendingUp,
    FaUsers,
    FaBookmark,
    FaShare,
    FaChartLine,
    FaLightbulb,
    FaGlobe,
    FaChevronLeft,
    FaChevronRight,
    FaArrowRight,
    FaArrowDown
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
    TrendingUp,
    Sparkles,
    Target,
    Award,
    Clock,
    MessageCircle,
    ThumbsUp,
    BookOpen,
    PenTool,
    Image as ImageIcon,
    Video,
    Music,
    FileText
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit,
    where,
    doc,
    getDoc
} from 'firebase/firestore';
import { toast } from 'react-toastify';

const HomePage = () => {
    const navigate = useNavigate();
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalUsers: 0,
        totalLikes: 0,
        totalComments: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const scaleIn = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 }
    };

    // Fetch featured posts and stats
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch featured posts
            const featuredQuery = query(
                collection(db, "content"),
                orderBy("createdAt", "desc"),
                limit(6)
            );

            // Fetch trending posts (by likes)
            const trendingQuery = query(
                collection(db, "content"),
                orderBy("likes", "desc"),
                limit(4)
            );

            const [featuredSnapshot, trendingSnapshot] = await Promise.all([
                getDocs(featuredQuery),
                getDocs(trendingQuery)
            ]);

            const featured = featuredSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            const trending = trendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            setFeaturedPosts(featured);
            setTrendingPosts(trending);

            // Calculate basic stats
            const allPostsQuery = query(collection(db, "content"));
            const allPostsSnapshot = await getDocs(allPostsQuery);
            
            let totalLikes = 0;
            let totalComments = 0;
            
            allPostsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                totalLikes += (data.likes?.length || 0);
                totalComments += (data.comments || 0);
            });

            setStats({
                totalPosts: allPostsSnapshot.size,
                totalUsers: 0, // Would need to fetch users collection
                totalLikes,
                totalComments
            });

            setError('');
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load content");
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        setIsVisible(true);
    }, [fetchData]);

    // Auto-rotate carousel
    useEffect(() => {
        if (featuredPosts.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [featuredPosts.length]);

    // Enhanced Hero Section with animations
    const HeroSection = () => (
        <motion.section 
            className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative container mx-auto px-4 py-20 lg:py-32">
                <motion.div 
                    className="max-w-6xl mx-auto text-center"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={fadeInUp} className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-medium">Join 10,000+ creators worldwide</span>
                        </div>
                    </motion.div>

                    <motion.h1 
                        className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
                        variants={fadeInUp}
                    >
                        Create Amazing{' '}
                        <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Content
                        </span>
                        <br />
                        <span className="text-4xl md:text-5xl">Share Your Story</span>
                    </motion.h1>

                    <motion.p 
                        className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed"
                        variants={fadeInUp}
                    >
                        The ultimate platform for content creators. Share your ideas, connect with your audience, 
                        and grow your creative community with powerful tools and beautiful design.
                    </motion.p>

                    <motion.div 
                        className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                        variants={fadeInUp}
                    >
                        <motion.button
                            onClick={() => navigate('/create-content')}
                            className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center gap-3">
                                <PenTool className="w-5 h-5" />
                                Start Creating
                                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                        
                        <motion.button
                            onClick={() => navigate('/public-content')}
                            className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5" />
                                Explore Content
                                <FaArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                        variants={staggerContainer}
                    >
                        {[
                            { icon: <FileText className="w-8 h-8" />, value: stats.totalPosts, label: "Posts Created", color: "text-blue-400" },
                            { icon: <Users className="w-8 h-8" />, value: "1.2K+", label: "Active Users", color: "text-green-400" },
                            { icon: <Heart className="w-8 h-8" />, value: stats.totalLikes, label: "Total Likes", color: "text-red-400" },
                            { icon: <MessageCircle className="w-8 h-8" />, value: stats.totalComments, label: "Comments", color: "text-purple-400" }
                        ].map((stat, index) => (
                            <motion.div 
                                key={index}
                                className="text-center"
                                variants={scaleIn}
                            >
                                <div className={`${stat.color} mb-2 flex justify-center`}>
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm opacity-70">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
                </div>
            </motion.div>
        </motion.section>
    );

    // Enhanced Features Section
    const FeaturesSection = () => (
        <motion.section 
            className="py-24 bg-gradient-to-b from-gray-50 to-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="container mx-auto px-4">
                <motion.div 
                    className="max-w-4xl mx-auto text-center mb-16"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-6">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">Why Choose Us</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Everything You Need to{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Succeed
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Powerful tools, beautiful design, and a supportive community to help you create and grow
                    </p>
                </motion.div>

                <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        {
                            icon: <PenTool className="w-12 h-12 text-blue-500" />,
                            title: "Rich Content Editor",
                            description: "Create stunning content with our advanced editor, templates, and media tools.",
                            features: ["Rich text formatting", "Image & video support", "Content templates", "Auto-save drafts"]
                        },
                        {
                            icon: <Users className="w-12 h-12 text-green-500" />,
                            title: "Community Features",
                            description: "Connect with your audience through comments, likes, follows, and real-time interactions.",
                            features: ["Follow system", "Real-time comments", "Engagement analytics", "User discovery"]
                        },
                        {
                            icon: <FaChartLine className="w-12 h-12 text-purple-500" />,
                            title: "Analytics Dashboard",
                            description: "Track your content performance with detailed analytics and insights.",
                            features: ["View tracking", "Engagement metrics", "Growth insights", "Content performance"]
                        },
                        {
                            icon: <Zap className="w-12 h-12 text-yellow-500" />,
                            title: "Lightning Fast",
                            description: "Optimized for speed with lazy loading, CDN, and modern web technologies.",
                            features: ["Fast loading", "Mobile optimized", "PWA support", "Offline capabilities"]
                        },
                        {
                            icon: <Award className="w-12 h-12 text-red-500" />,
                            title: "Creator Rewards",
                            description: "Earn recognition and rewards for your amazing content and community engagement.",
                            features: ["Creator badges", "Featured content", "Community recognition", "Growth rewards"]
                        },
                        {
                            icon: <FaGlobe className="w-12 h-12 text-indigo-500" />,
                            title: "Global Reach",
                            description: "Share your content with a worldwide audience and discover creators from everywhere.",
                            features: ["Global audience", "Multi-language", "Cultural diversity", "Worldwide discovery"]
                        }
                    ].map((feature, index) => (
                        <motion.div 
                            key={index}
                            className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                            variants={scaleIn}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {feature.description}
                            </p>
                            <ul className="space-y-2">
                                {feature.features.map((item, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-500">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );

    // Featured Content Carousel
    const FeaturedContentSection = () => (
        <motion.section 
            className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="container mx-auto px-4">
                <motion.div 
                    className="text-center mb-16"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">Featured Content</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Discover Amazing{' '}
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                            Stories
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Explore trending content from our creative community
                    </p>
                </motion.div>

                {featuredPosts.length > 0 && (
                    <div className="relative max-w-6xl mx-auto">
                        <div className="overflow-hidden rounded-3xl">
                            <motion.div 
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {featuredPosts.map((post, index) => (
                                    <div key={post.id} className="w-full flex-shrink-0">
                                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12">
                                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        <span className="text-sm text-gray-300">Featured</span>
                                                    </div>
                                                    <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-lg text-gray-300 mb-8 leading-relaxed line-clamp-4">
                                                        {post.body}
                                                    </p>
                                                    <div className="flex items-center gap-6 mb-8">
                                                        <div className="flex items-center gap-2">
                                                            <Heart className="w-5 h-5 text-red-400" />
                                                            <span>{post.likes?.length || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MessageCircle className="w-5 h-5 text-blue-400" />
                                                            <span>{post.comments || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-5 h-5 text-green-400" />
                                                            <span>{post.views || 0}</span>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        onClick={() => navigate('/public-content')}
                                                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        Read Full Story
                                                    </motion.button>
                                                </div>
                                                {post.image && (
                                                    <div className="relative">
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Carousel Controls */}
                        <div className="flex justify-center gap-4 mt-8">
                            {featuredPosts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        currentSlide === index 
                                            ? 'bg-white scale-125' 
                                            : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </motion.section>
    );

    // Trending Topics Section
    const TrendingSection = () => (
        <motion.section 
            className="py-24 bg-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="container mx-auto px-4">
                <motion.div 
                    className="text-center mb-16"
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 rounded-full px-4 py-2 mb-6">
                        <FaFire className="w-4 h-4" />
                        <span className="text-sm font-medium">Trending Now</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        What's{' '}
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            Hot
                        </span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trendingPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            {post.image && (
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-gray-500">#{index + 1} Trending</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {post.body}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-4 h-4 text-red-400" />
                                            <span>{post.likes?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4 text-blue-400" />
                                            <span>{post.comments || 0}</span>
                                        </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Read →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );

    // Enhanced CTA Section
    const CTASection = () => (
        <motion.section 
            className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative container mx-auto px-4 text-center">
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Rocket className="w-4 h-4" />
                        <span className="text-sm font-medium">Ready to Start?</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">
                        Join the{' '}
                        <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                            Revolution
                        </span>
                    </h2>
                    <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
                        Be part of the next generation of content creators. Start sharing your story today 
                        and connect with millions of like-minded individuals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <motion.button
                            onClick={() => navigate('/create-content')}
                            className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center gap-3">
                                <PenTool className="w-5 h-5" />
                                Start Creating Now
                                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                        <motion.button
                            onClick={() => navigate('/auth')}
                            className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5" />
                                Join Community
                                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );

    // Enhanced Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col justify-center items-center text-white">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Loading Amazing Content...</h2>
                    <p className="text-white/70">Preparing your creative journey</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <HeroSection />
            <FeaturesSection />
            <FeaturedContentSection />
            <TrendingSection />
            <CTASection />
        </div>
    );
};

export default HomePage;
