import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import axios from "axios";
import {FcLike} from "react-icons/fc";
import {FaRegHeart} from "react-icons/fa6";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LikeDislikePost = (props) => {
    const [post, setPost] = useState(props.post)
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const token = useSelector(state => state?.user?.currentUser?.token)
    const [postLiked, setPostLiked] = useState(post?.likes?.includes?.userId)
    const [isAnimating, setIsAnimating] = useState(false)

    const handleLikeDislikePost = async () => {
        try {
            setIsAnimating(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post?._id}/like`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setPost(response?.data)
            if (!postLiked) {
                toast.success('Post liked!', {
                    icon: '❤️',
                    duration: 2000,
                });
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to like post');
        } finally {
            setTimeout(() => setIsAnimating(false), 500);
        }
    }

    const handleCheckIfUserLikedPost = async () => {
        if(post?.likes?.includes(userId)) {
            setPostLiked(true)
        } else {
            setPostLiked(false)
        }
    }

    useEffect(() => {
        handleCheckIfUserLikedPost()
    }, [post])

    const heartVariants = {
        initial: { scale: 1 },
        animate: { 
            scale: [1, 1.5, 1],
            transition: { duration: 0.5 }
        }
    };

    const countVariants = {
        initial: { scale: 1 },
        animate: { 
            scale: [1, 1.2, 1],
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.button 
            className={'feed__footer-comments'} 
            onClick={handleLikeDislikePost}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={postLiked ? 'liked' : 'unliked'}
                    initial="initial"
                    animate={isAnimating ? "animate" : "initial"}
                    variants={heartVariants}
                >
                    {postLiked ? <FcLike/> : <FaRegHeart/>}
                </motion.div>
            </AnimatePresence>
            <motion.small
                initial="initial"
                animate={isAnimating ? "animate" : "initial"}
                variants={countVariants}
            >
                {post?.likes?.length}
            </motion.small>
        </motion.button>
    )
}

export default LikeDislikePost
