import React, { useState, useEffect } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { db } from '../firebase'; 
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

const Contact = () => {
    const [userInfo, setUserInfo] = useState({ email: '', userName: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
               
                const userDoc = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    setUserInfo({
                        email: user.email,
                        userName: docSnap.data().username || '', 
                    });
                }
            } else {
            
                setUserInfo({ email: '', userName: '' });
            }
        });

        return () => unsubscribe(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Add the contact message to Firestore
            await addDoc(collection(db, "contactMessages"), {
                name: userInfo.userName,
                email: userInfo.email,
                message,
                createdAt: new Date(),
            });
            setSuccess("Your message has been sent successfully!");
            setMessage('');
            setError('');
        } catch (e) {
            console.error("Error adding document: ", e);
            setError("Failed to send message. Please try again.");
        }
    };

    return (
        <section id="contact" className="section container mx-auto my-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-5xl font-extrabold mb-4 text-blue-700 text-center">Contact Me</h2>
            <div className="flex justify-center mb-6">
                <a href="mailto:psamarpaudel@gmail.com" className="flex items-center text-gray-600 hover:text-blue-600 transition duration-300">
                    <FaEnvelope className="mr-2" /> Email Me
                </a>
            </div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <input
                    type="text"
                    placeholder="Your Name"
                    value={userInfo.userName}
                    readOnly
                    className="border p-2 rounded mb-4 w-full bg-gray-100"
                />
                <input
                    type="email"
                    placeholder="Your Email"
                    value={userInfo.email}
                    readOnly
                    className="border p-2 rounded mb-4 w-full bg-gray-100"
                />
                <textarea
                    placeholder="Your Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="border p-2 rounded mb-4 w-full"
                    rows="4"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full">
                    Send Message
                </button>
            </form>
        </section>
    );
};

export default Contact;