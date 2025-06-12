import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import axios from "axios";
import MessageListItem from "./MessageListItem.jsx";

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

    useEffect(() => {
        getConversations()
    }, [socket])


    return (
        <menu className={'messageList'}>
            <h3>Recent Messages</h3>
            {
                conversations?.map((conversation) => <MessageListItem key={conversation?._id} conversation={conversation} />)
            }
        </menu>
    )
}
export default MessagesList
