import React, { useState, useEffect } from 'react'
import Feed from "./Feed.jsx";
import FeedSkeleton from "./FeedSkeleton.jsx";
import { motion, AnimatePresence } from 'framer-motion';

const Feeds = ({posts}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [posts]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div 
            className={'feeds'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <FeedSkeleton />
                ) : posts?.length < 1 ? (
                    <motion.p 
                        className={'center'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        No posts found.
                    </motion.p>
                ) : (
                    posts?.map(post => (
                        <motion.div
                            key={post?._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Feed post={post} />
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </motion.div>
    )
}
export default Feeds
