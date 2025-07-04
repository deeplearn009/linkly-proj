import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import axios from "axios";
import MessageListItem from "./MessageListItem.jsx";
import { motion, AnimatePresence } from 'framer-motion';

const MessagesList = () => {

    const [conversations, setConversations] = useState([])
    const token = useSelector(state => state?.user?.currentUser?.token)
    const socket = useSelector(state => state?.user?.socket)

    const getConversations = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setConversations(response?.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteConversation = (conversationId) => {
        setConversations(prevConversations => 
            prevConversations.filter(conv => conv._id !== conversationId)
        );
    };

    useEffect(() => {
        getConversations()
    }, [socket])

    return (
        <menu className={'messageList'}>
            <h3>Recent Messages</h3>
            <AnimatePresence>
                {conversations?.map((conversation) => (
                    <motion.div
                        key={conversation._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MessageListItem 
                            conversation={conversation} 
                            onDeleteConversation={handleDeleteConversation}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
            {conversations.length === 0 && (
                <div className="messageList__empty">
                    <p>No conversations yet</p>
                    <small>Start a conversation by messaging someone!</small>
                </div>
            )}
        </menu>
    )
}
export default MessagesList
