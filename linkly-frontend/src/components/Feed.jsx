import React, {useEffect, useState} from 'react'
import axios from "axios";
import {useSelector} from "react-redux";
import {Link, useLocation} from "react-router-dom";
import ProfileImage from "./ProfileImage.jsx";
import TimeAgo from "react-timeago";
import {FaRegCommentDots} from "react-icons/fa";
import {IoMdShare} from "react-icons/io";
import LikeDislikePost from "./LikeDislikePost.jsx";
import TrimText from "../helpers/TrimText.jsx";
import BookmarkPost from "./BookmarkPost.jsx";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Feed = ({post}) => {

    const [creator, setCreator] = useState({})
    const token = useSelector(state => state?.user?.currentUser?.token)
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const [showFeedHeaderMenu, setShowFeedHeaderMenu] = useState(false);

    const location = useLocation();


    const getPostCreator = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${post?.creator}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setCreator(response?.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getPostCreator()
    }, [])

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/posts/${post?._id}`);
        toast.success('Post link copied to clipboard!');
    };

    const feedVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const menuVariants = {
        hidden: { opacity: 0, scale: 0.8 },
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
            scale: 0.8,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <motion.article 
            className={'feed'}
            variants={feedVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <header className={'feed__header'}>
                <Link to={`/users/${post?.creator}`} className={'feed__header-profile'}>
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                        <ProfileImage image={creator?.profilePhoto}/>
                    </motion.div>
                    <div className="feed__header-details">
                        <h4>{creator?.fullName}</h4>
                        <small><TimeAgo date={post?.createdAt}/></small>
                    </div>
                </Link>
                <AnimatePresence>
                    {showFeedHeaderMenu && userId == post?.creator && location.pathname.includes("users") && (
                        <motion.menu 
                            className={'feed__header-menu'}
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={showEditPostModal}
                            >
                                Edit
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={deletePost}
                            >
                                Delete
                            </motion.button>
                        </motion.menu>
                    )}
                </AnimatePresence>
            </header>
            <Link to={`/posts/${post?._id}`} className={'feed__body'}>
                <motion.p 
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                >
                    <TrimText item={post?.body} maxLength={160}/>
                </motion.p>
                <motion.div 
                    className="feed__images"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <img src={post?.image} alt=""/>
                </motion.div>
            </Link>
            <footer className="feed__footer">
                <div>
                    <LikeDislikePost post={post} />
                    <motion.button 
                        className="feed__footer-comments"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Link to={`/posts/${post?._id}`}><FaRegCommentDots/></Link>
                        <small>{post?.comments?.length}</small>
                    </motion.button>
                    <motion.button 
                        className={'feed__footer-share'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                    >
                        <IoMdShare/>
                    </motion.button>
                </div>
                <BookmarkPost post={post}/>
            </footer>
        </motion.article>
    )
}
export default Feed
