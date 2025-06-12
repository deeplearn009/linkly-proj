import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Feed from './Feed';
import { IoClose } from 'react-icons/io5';
import './LikedPostsList.css';

const LikedPostsList = ({ userId, onClose }) => {
    const [likedPosts, setLikedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = useSelector(state => state?.user?.currentUser?.token);

    const getLikedPosts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/likes`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure we have the creator information for each post
            const postsWithCreator = response?.data?.map(post => ({
                ...post,
                creator: post.creator || post.creatorId // Handle both possible field names
            }));
            setLikedPosts(postsWithCreator);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getLikedPosts();
    }, [userId]);

    const modalVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.95,
        },
        visible: { 
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: { 
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: "easeIn"
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.2
            }
        },
        exit: { 
            opacity: 0,
            transition: {
                duration: 0.15
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                className="liked-posts-overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose}
            >
                <motion.div 
                    className="liked-posts-modal"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="liked-posts-header">
                        <h3>Liked Posts</h3>
                        <motion.button 
                            className="close-button"
                            onClick={onClose}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <IoClose />
                        </motion.button>
                    </div>
                    <div className="liked-posts-content">
                        {isLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading liked posts...</p>
                            </div>
                        ) : likedPosts.length === 0 ? (
                            <div className="no-posts-container">
                                <p>No liked posts yet</p>
                            </div>
                        ) : (
                            <div className="posts-grid">
                                {likedPosts.map((post, index) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.3,
                                            delay: index * 0.1 
                                        }}
                                    >
                                        <Feed 
                                            post={post} 
                                            creator={post.creator}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LikedPostsList; 