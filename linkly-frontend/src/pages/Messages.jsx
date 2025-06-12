import React, {useEffect, useRef, useState} from 'react'
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {userActions} from "../redux/user-slice.js";
import ProfileImage from "../components/ProfileImage.jsx";
import MessageItem from "../components/MessageItem.jsx";
import {IoMdSend} from "react-icons/io";

const Messages = () => {

    const {receiverId} = useParams()
    const [messages, setMessages] = useState([])
    const [otherMessager, setOtherMessager] = useState({})
    const [messageBody, setMessageBody] = useState("")
    const [conversationId, setConversationId] = useState("")
    const messageEndRef = useRef()

    const token = useSelector((state) => state?.user?.currentUser?.token)

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
            if (Array.isArray(response?.data)) {
                setMessages(response.data);
                if (response.data.length > 0) {
                    setConversationId(response.data[0]?.conversationId);
                }
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setMessages([]);
        }
    }

    const socket = useSelector(state => state?.user?.socket)

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
            console.error('Error sending message:', err);
        }
    }

    const dispatch = useDispatch()
    const conversations = useSelector(state => state?.user?.conversations)

    useEffect(() => {
        if (socket) {
            socket.on("newMessage", message => {
                setMessages(prevMessages => [...prevMessages, message]);

                dispatch(userActions?.setConversations(conversations.map(conversation => {
                    if (conversation?._id === conversationId) {
                        return {...conversation, lastMessage: {...conversation.lastMessage, seen: true}};
                    }
                    return conversation;
                })));
            });
        }

        return () => {
            if (socket) {
                socket.off("newMessage");
            }
        };
    }, [socket, conversationId, conversations, dispatch]);

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
