import React, { useState } from 'react'
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import { IoTrashOutline } from "react-icons/io5";
import { motion } from 'framer-motion';
import ProfileImage from "./ProfileImage.jsx";
import TrimText from "../helpers/TrimText.jsx";
import TimeAgo from "react-timeago";
import axios from "axios";
import toast from 'react-hot-toast';

const MessageListItem = ({conversation, onDeleteConversation}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const onlineUsers = useSelector(state => state?.user?.onlineUsers);
    const token = useSelector(state => state?.user?.currentUser?.token);

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/conversations/${conversation._id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Conversation deleted successfully');
            onDeleteConversation(conversation._id);
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error('Failed to delete conversation');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <motion.div 
            className={'messageList__item'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
        >
            <Link to={`/messages/${conversation?.participants[0]?._id}`} className="messageList__item-link">
                <ProfileImage 
                    image={conversation?.participants[0]?.profilePhoto} 
                    className={onlineUsers?.includes(conversation?.participants[0]?._id) ? 'active' : ''} 
                />
                <div className={'messageList__item-details'}>
                    <h5>{conversation?.participants[0]?.fullName}</h5>
                    <p><TrimText item={conversation?.lastMessage?.text} maxLength={16}/></p>
                    <small><TimeAgo date={conversation?.createdAt}/></small>
                </div>
            </Link>
            
            <motion.button
                className="messageList__item-delete"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                title="Delete conversation"
            >
                <IoTrashOutline />
            </motion.button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="delete-confirmation-overlay" onClick={handleDeleteCancel}>
                    <motion.div 
                        className="delete-confirmation-modal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4>Delete Conversation</h4>
                        <p>Are you sure you want to delete this conversation with {conversation?.participants[0]?.fullName}?</p>
                        <p><small>This action cannot be undone.</small></p>
                        <div className="delete-confirmation-actions">
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-danger" 
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}
export default MessageListItem
