import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import axios from "axios";
import Feed from "../components/Feed.jsx";
import FeedSkeleton from "../components/FeedSkeleton.jsx";
import HeaderInfo from "../components/HeaderInfo.jsx";

const Bookmarks = () => {

    const [bookmarks, setBookmarks] = useState([])
    const [loading, setLoading] = useState(false)
    const token = useSelector(state => state?.user?.currentUser?.token)

    const getBookmarks = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/bookmarks`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setBookmarks(response?.data?.bookmarks)
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        getBookmarks()
    }, [])

    console.log(bookmarks)


    return (
        <section>
            <HeaderInfo text='My Bookmarks' />
            {loading ? <FeedSkeleton /> :
            bookmarks?.length < 1 ? <p className={'center'}>No posts bookmarked</p> : bookmarks?.map(bookmark => <Feed key={bookmark?._id} post={bookmark} />)}
        </section>
    )
}
export default Bookmarks
