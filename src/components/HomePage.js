import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCode, 
    FaLaptopCode, 
    FaDatabase, 
    FaReact, 
    FaNodeJs, 
    FaGithub, 
    FaLinkedin, 
    FaEnvelope 
} from 'react-icons/fa';

const HomePage = () => {
    // Skills data
    const skills = [
        { 
            icon: <FaReact className="text-4xl text-blue-500" />, 
            title: 'React', 
            description: 'Building interactive and dynamic web applications' 
        },
        { 
            icon: <FaNodeJs className="text-4xl text-green-500" />, 
            title: 'Node.js', 
            description: 'Server-side development and backend solutions' 
        },
        { 
            icon: <FaDatabase className="text-4xl text-purple-500" />, 
            title: 'Database', 
            description: 'MongoDB, Firebase, and SQL database management' 
        }
    ];

    // Projects data
    const projects = [
        {
            title: 'Content Platform',
            description: 'A full-stack content sharing and management application',
            technologies: ['React', 'Firebase', 'Tailwind CSS'],
            link: '/public-content'
        },
        {
            title: 'Portfolio Website',
            description: 'Personal portfolio showcasing skills and projects',
            technologies: ['React', 'Tailwind CSS', 'Firebase'],
            link: '#'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-24 pb-16 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        Hi, I'm Swastik Paudel
                    </h1>
                    <p className="text-2xl text-gray-600 mb-6">
                        Full Stack Developer | React & Node.js Enthusiast
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4">
                        <Link 
                            to="/contact" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Contact Me
                        </Link>
                        <a 
                            href="/resume.pdf" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
                        >
                            Download CV
                        </a>
                    </div>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white">
        <img 
            src="/profile-pic.png"  
            alt="Swastik Paudel" 
            className="w-full h-full object-cover object-top"
        />
    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="container mx-auto px-4 py-16 bg-white">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    My Skills
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {skills.map((skill, index) => (
                        <div 
                            key={index} 
                            className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-xl transition"
                        >
                            <div className="flex justify-center mb-4">
                                {skill.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{skill.title}</h3>
                            <p className="text-gray-600">{skill.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    Recent Projects
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {projects.map((project, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                        >
                            <div className="p-6">
                                <h3 className="text-2xl font-semibold mb-3">{project.title}</h3>
                                <p className="text-gray-600 mb-4">{project.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.technologies.map((tech, techIndex) => (
                                        <span 
                                            key={techIndex} 
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <Link 
                                    to={project.link} 
                                    className="text-blue-600 hover:underline"
                                >
                                    View Project
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Let's Connect</h2>
                    <p className="text-xl mb-8">
                        Interested in collaborating or have a project in mind?
                    </p>
                    <div className="flex justify-center space-x-6">
                        <a 
                            href="https://github.com/Swastik45/ContentCreatingSite" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-4xl hover:text-gray-200 transition"
                        >
                            <FaGithub />
                        </a>
                        <a 
                            href="https://www.linkedin.com/in/swastik-paudel-876925273/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-4xl hover:text-gray-200 transition"
                        >
                            <FaLinkedin />
                        </a>
                        <a 
                            href="mailto:psamarpaudel@example.com" 
                            className="text-4xl hover:text-gray-200 transition"
                        >
                            <FaEnvelope />
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Swastik Paudel. All rights reserved.</p>
                </div> </footer>
            </div>
        );
    };

    export default HomePage;