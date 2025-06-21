import React, {useEffect, useRef, useState} from 'react'
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {userActions} from "../redux/user-slice.js";
import ProfileImage from "../components/ProfileImage.jsx";
import MessageItem from "../components/MessageItem.jsx";
import {IoMdSend} from "react-icons/io";
import { toast } from 'react-hot-toast';
import socketService from '../services/socketService.js';

const Messages = () => {

    const {receiverId} = useParams()
    const [messages, setMessages] = useState([])
    const [otherMessager, setOtherMessager] = useState({})
    const [messageBody, setMessageBody] = useState("")
    const [conversationId, setConversationId] = useState("")
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
                    <ProfileImage image={otherMessager?.profilePhoto} />
                    <div className={'messagesBox__header-info'}>
                        <h4>{otherMessager?.fullName}</h4>
                        <small>Last seen</small>
                    </div>
                </header>
                <ul className={'messagesBox__messages'}>
                    {
                        messages?.map(message => <MessageItem message={message} />)
                    }
                    <div ref={messageEndRef}></div>
                </ul>
                <form onSubmit={sendMessage}>
                    <input type="text" value={messageBody} onChange={({target}) => setMessageBody(target.value)} placeholder="Enter message..." autoFocus={true} />
                    <button type={'submit'}><IoMdSend/></button>
                </form>
            </section>}



        </>
    )
}
export default Messages
