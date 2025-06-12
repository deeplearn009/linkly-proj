import React, {useEffect, useState} from 'react'
import UserProfile from "../components/UserProfile.jsx";
import HeaderInfo from "../components/HeaderInfo.jsx";
import axios from "axios";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import * as response from "framer-motion/m";
import Feed from "../components/Feed.jsx";
import EditPostModal from "../components/EditPostModal.jsx";
import toast from 'react-hot-toast';
import editProfileModal from "../components/EditProfileModal.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";

const Profile = () => {

    const [user, setUser] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const {id: userId} = useParams()
    const token = useSelector(state => state?.user?.currentUser?.token);
    const editPostModalOpen = useSelector(state => state?.ui?.editPostModalOpen);
    const editProfileModalOpen = useSelector(state => state?.ui?.editProfileModalOpen);


    const getUserPosts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/posts`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setUser(response?.data);
            setUserPosts(response?.data?.posts);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    }


    useEffect(() => {
        getUserPosts()
    }, [userId])

    const deletePost = async (postId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setUserPosts(userPosts?.filter(p => p?._id != postId));
            toast.success('Post deleted successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete post');
        }
    }

    const updatePost = async (data, postId) => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/posts/${postId}`, data, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            if(response?.status === 200) {
                const updatedPost = response?.data;
                setUserPosts(userPosts?.map(post => {
                    if(updatedPost?._id.toString() === post?._id.toString()) {
                        return {
                            ...post,
                            body: updatedPost.body
                        };
                    }
                    return post;
                }));
                toast.success('Post updated successfully!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update post');
        }
    }

    return (
        <section>
            <UserProfile />
            <HeaderInfo text={`${user?.fullName}'s posts`} />
            <section className="profile__posts">
                {
                    userPosts?.length < 1 ? <p className='center'>No posts found.</p> : userPosts?.map((post) => <Feed key={post?._id} post={post} onDeletePost={deletePost}/>)
                }
            </section>
            {editPostModalOpen && <EditPostModal onUpdatePost={updatePost}/>}
            {editProfileModalOpen && <EditProfileModal/>}
        </section>
    )
}
export default Profile