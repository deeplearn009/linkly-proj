import React, {useEffect, useRef, useState} from 'react'
import {useParams, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {userActions} from "../redux/user-slice.js";
import ProfileImage from "../components/ProfileImage.jsx";
import MessageItem from "../components/MessageItem.jsx";
import {IoMdSend} from "react-icons/io";
import {IoTrashOutline} from "react-icons/io5";
import { toast } from 'react-hot-toast';
import socketService from '../services/socketService.js';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {

    const {receiverId} = useParams()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [otherMessager, setOtherMessager] = useState({})
    const [messageBody, setMessageBody] = useState("")
    const [conversationId, setConversationId] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const messageEndRef = useRef()

    const token = useSelector((state) => state?.user?.currentUser?.token)
    const currentUserId = useSelector((state) => state?.user?.currentUser?.id || state?.user?.currentUser?._id)

    const getOtherMessager = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${receiverId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setOtherMessager(response?.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteConversation = async () => {
        if (!conversationId) {
            toast.error('No conversation found to delete');
            return;
        }

        setIsDeleting(true);
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Conversation deleted successfully');
            navigate('/messages'); // Redirect to messages list
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error('Failed to delete conversation');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        messageEndRef?.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    const getMessages = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${receiverId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            });
            setMessages(response?.data || []);
            if (response?.data?.length > 0) {
                setConversationId(response?.data[0]?.conversationId);
            }
        } catch (err) {
            console.error(err);
            setMessages([]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageBody.trim()) return;
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/messages/${receiverId}`,
                { messageBody },
                {
                    withCredentials: true,
                    headers: {Authorization: `Bearer ${token}`}
                }
            );
            setMessages(prevMessages => [...prevMessages, response?.data]);
            setMessageBody("");
        } catch (err) {
            console.error(err);
            toast.error('Failed to send message');
        }
    };

    const dispatch = useDispatch()
    const conversations = useSelector(state => state?.user?.conversations)

    useEffect(() => {
        if (!socketService.isConnected()) return;

        const handleNewMessage = (message) => {
            // Don't add the message if it's from the current user (to prevent duplicates)
            if (message?.senderId === currentUserId) {
                return;
            }
            
            setMessages(prevMessages => [...prevMessages, message]);

            // Update conversations if needed
            if (conversations && conversationId) {
                dispatch(userActions?.setConversations(conversations.map(conversation => {
                    if(conversation?._id == conversationId) {
                        return {...conversation, lastMessage: {...conversation.lastMessage, seen: true}};
                    }
                    return conversation;
                })));
            }
        };

        // Add event listener
        socketService.on("newMessage", handleNewMessage);

        // Cleanup function
        return () => {
            socketService.off("newMessage", handleNewMessage);
        };
    }, [conversationId, conversations, dispatch, currentUserId]);

    useEffect(() => {
        getMessages()
        getOtherMessager()
    }, [receiverId]);


    return (
        <>
            {<section className={'messagesBox'}>
                <header className={'messagesBox__header'}>
                    <div className="messagesBox__header-left">
                        <ProfileImage image={otherMessager?.profilePhoto} />
                        <div className={'messagesBox__header-info'}>
                            <h4>{otherMessager?.fullName}</h4>
                            <small>Last seen</small>
                        </div>
                    </div>
                    <motion.button
                        className="messagesBox__header-delete"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                        title="Delete conversation"
                    >
                        <IoTrashOutline />
                    </motion.button>
                </header>
                <ul className={'messagesBox__messages'}>
                    {
                        messages?.map(message => <MessageItem key={message._id} message={message} />)
                    }
                    <div ref={messageEndRef}></div>
                </ul>
                <form onSubmit={sendMessage}>
                    <input type="text" value={messageBody} onChange={({target}) => setMessageBody(target.value)} placeholder="Enter message..." autoFocus={true} />
                    <button type={'submit'}><IoMdSend/></button>
                </form>
            </section>}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="delete-confirmation-overlay" onClick={() => setShowDeleteConfirm(false)}>
                        <motion.div 
                            className="delete-confirmation-modal"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4>Delete Conversation</h4>
                            <p>Are you sure you want to delete this conversation with {otherMessager?.fullName}?</p>
                            <p><small>This action cannot be undone.</small></p>
                            <div className="delete-confirmation-actions">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={handleDeleteConversation}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
export default Messages
