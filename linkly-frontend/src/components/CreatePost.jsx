import React, {useEffect, useState} from 'react'
import ProfileImage from "./ProfileImage.jsx";
import {useSelector} from "react-redux";
import {SlPicture} from "react-icons/sl";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { IoClose } from "react-icons/io5";
import { BsCameraVideo } from "react-icons/bs";
import axios from "axios";

const CreatePost = ({onCreatePost, error}) => {
    const [user, setuser] = useState({})
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const token = useSelector(state => state?.user?.currentUser?.token)
    const [body, setBody] = useState('');
    const [media, setMedia] = useState('');
    const [mediaPreview, setMediaPreview] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);


    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setuser(response?.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    const createPost = async (e) => {
        e.preventDefault();
        if (!body.trim() && !media) {
            toast.error('Please add some content to your post');
            return;
        }
        
        setIsSubmitting(true);
        const postData = new FormData();
        postData.set('body', body);
        postData.set('media', media);
        
        try {
            await onCreatePost(postData);
            toast.success('Post created successfully!');
            setBody('');
            setMedia('');
            setMediaPreview('');
            setMediaType('');
        } catch (err) {
            toast.error('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'mov', 'avi', 'wmv'].includes(fileExtension);
            const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

            if (!isVideo && !isImage) {
                toast.error('Please upload a valid image or video file');
                return;
            }

            setMedia(file);
            setMediaType(isVideo ? 'video' : 'image');

            if (isVideo) {
                const videoUrl = URL.createObjectURL(file);
                setMediaPreview(videoUrl);
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const removeMedia = () => {
        setMedia('');
        setMediaPreview('');
        setMediaType('');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <motion.form 
            className="createPost" 
            encType={'multipart/form-data'} 
            onSubmit={createPost}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {error && (
                    <motion.p 
                        className={'createPost__error-message'}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
            
            <motion.div 
                className="createPost__top"
                variants={itemVariants}
            >
                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                    <ProfileImage image={user?.profilePhoto}/>
                </motion.div>
                <motion.textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder={'What is on your mind?'}
                    whileFocus={{ scale: 1.01 }}
                />
            </motion.div>
            
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div 
                        className="createPost__media-preview"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        variants={itemVariants}
                    >
                        {mediaType === 'video' ? (
                            <video 
                                src={mediaPreview} 
                                controls 
                                className="createPost__video-preview"
                            />
                        ) : (
                            <img src={mediaPreview} alt="Preview" />
                        )}
                        <motion.button 
                            type="button"
                            className="createPost__remove-media"
                            onClick={removeMedia}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <IoClose />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <motion.div 
                className="createPost__bottom"
                variants={itemVariants}
            >
                <span></span>
            </motion.div>
            
            <motion.div 
                className="createPost__actions"
                variants={itemVariants}
            >
                <div className="createPost__media-buttons">
                    <motion.label 
                        htmlFor="image"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Upload Image"
                    >
                        <SlPicture/>
                    </motion.label>
                    <motion.label 
                        htmlFor="video"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Upload Video"
                    >
                        <BsCameraVideo/>
                    </motion.label>
                </div>
                <input 
                    type="file" 
                    id="image" 
                    onChange={handleMediaChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <input 
                    type="file" 
                    id="video" 
                    onChange={handleMediaChange}
                    accept="video/*"
                    style={{ display: 'none' }}
                />
                <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </motion.button>
            </motion.div>
        </motion.form>
    )
}
export default CreatePost
