import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import CreatePost from "../components/CreatePost.jsx";
import axios from "axios";
import Feeds from "../components/Feeds.jsx";

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedType, setFeedType] = useState('forYou'); // 'forYou' or 'following'
    const token = useSelector(state => state?.user?.currentUser?.token);

    const createPost = async (data) => {
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/posts`, data, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            const newPost = response?.data;
            setPosts([newPost, ...posts]);
        } catch (err) {
            setError(err?.response?.data?.message);
        }
    }

    const getPosts = async () => {
        setIsLoading(true);
        try {
            const endpoint = feedType === 'following' ? '/posts/following' : '/posts';
            const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setPosts(response?.data);
        } catch (err) {
            console.error(err)
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getPosts();
    }, [feedType])

    return (
        <section className="mainArea">
            <div className="forYouOrFollowing">
                <button 
                    className={feedType === 'forYou' ? 'active' : ''} 
                    onClick={() => setFeedType('forYou')}
                >
                    For You
                </button>
                <button 
                    className={feedType === 'following' ? 'active' : ''} 
                    onClick={() => setFeedType('following')}
                >
                    Following
                </button>
            </div>
            <CreatePost onCreatePost={createPost} error={error} />
            <Feeds posts={posts} onSetPosts={setPosts} />
        </section>
    )
}
export default Home
