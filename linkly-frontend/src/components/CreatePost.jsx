import React, {useState} from 'react'
import ProfileImage from "./ProfileImage.jsx";
import {useSelector} from "react-redux";
import {SlPicture} from "react-icons/sl";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CreatePost = ({onCreatePost, error}) => {
    const [body, setBody] = useState('');
    const [image, setImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);

    const createPost = async (e) => {
        e.preventDefault();
        if (!body.trim() && !image) {
            toast.error('Please add some content to your post');
            return;
        }
        
        setIsSubmitting(true);
        const postData = new FormData();
        postData.set('body', body);
        postData.set('image', image);
        
        try {
            await onCreatePost(postData);
            toast.success('Post created successfully!');
            setBody('');
            setImage('');
        } catch (err) {
            toast.error('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    }

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
                    <ProfileImage image={profilePhoto}/>
                </motion.div>
                <motion.textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    placeholder={'What is on your mind?'}
                    whileFocus={{ scale: 1.01 }}
                />
            </motion.div>
            
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
                <motion.label 
                    htmlFor="image"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <SlPicture/>
                </motion.label>
                <input type="file" id={'image'} onChange={e => setImage(e.target.files[0])}/>
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
