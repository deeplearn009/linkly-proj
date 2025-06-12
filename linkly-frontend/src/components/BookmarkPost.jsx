import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import axios from "axios";
import {FaBookmark} from "react-icons/fa6";
import {FaRegBookmark} from "react-icons/fa";

const BookmarkPost = ({post}) => {

    const [user, setUser] = useState({})
    const [postBookmarked, setPostBookmarked] = useState(user?.bookmarks?.includes(post?._id))
    const token = useSelector(state=>state?.user?.currentUser?.token)
    const userId = useSelector(state=>state?.user?.currentUser?.id)

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setUser(response?.data)
            if(response?.data?.bookmarks?.includes(post?._id)) {
                setPostBookmarked(true)
            } else {
                setPostBookmarked(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getUser()
    }, [userId])



    const createBookmark = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post?._id}/bookmark`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            if(response?.data?.bookmarks?.includes(post?._id)) {
                setPostBookmarked(true)
            } else {
                setPostBookmarked(false)
            }
        } catch (err) {
            console.error(err)
        }
    }


    return (
        <button className={'feed__footer-bookmark'} onClick={createBookmark}>
            {postBookmarked ? <FaBookmark/> : <FaRegBookmark/>}
        </button>
    )
}
export default BookmarkPost
