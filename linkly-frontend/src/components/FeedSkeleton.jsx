import React from 'react'
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import './FeedSkeleton.css';

const FeedSkeleton = () => {
    const theme = useSelector(state => state?.ui?.theme);
    const isDarkMode = theme?.backgroundColor === "dark";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            className={`feedSkeleton ${isDarkMode ? 'dark' : ''}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {[1, 2, 3].map((item) => (
                <motion.div
                    key={item}
                    className="feedSkeleton__item"
                    variants={itemVariants}
                >
                    <div className="feedSkeleton__header">
                        <div className="feedSkeleton__avatar" />
                        <div className="feedSkeleton__info">
                            <div className="feedSkeleton__name" />
                            <div className="feedSkeleton__time" />
                        </div>
                    </div>
                    <div className="feedSkeleton__content">
                        <div className="feedSkeleton__text">
                            <div className="feedSkeleton__text-line" />
                            <div className="feedSkeleton__text-line" />
                            <div className="feedSkeleton__text-line" />
                            <div className="feedSkeleton__text-line" />
                        </div>
                        <div className="feedSkeleton__image" />
                    </div>
                    <div className="feedSkeleton__footer">
                        <div className="feedSkeleton__actions">
                            <div className="feedSkeleton__action" />
                            <div className="feedSkeleton__action" />
                        </div>
                        <div className="feedSkeleton__bookmark" />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
export default FeedSkeleton
