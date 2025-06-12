import React, {useEffect, useState} from 'react'
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate, useParams} from "react-router-dom";
import {LuUpload} from "react-icons/lu";
import {FaCheck} from "react-icons/fa6";
import {userActions} from "../redux/user-slice.js";
import {uiSliceActions} from "../redux/ui-slice.js";
import FollowList from "./FollowList.jsx";
import LikedPostsList from "./LikedPostsList.jsx";
import { AnimatePresence } from 'framer-motion';

const UserProfile = () => {

    const token = useSelector(state => state?.user?.currentUser?.token)
    const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)
    const currentUser = useSelector(state => state?.user?.currentUser)


    const [user, setUser] = useState({});
    const [followsUser, setFollowsUser] = useState(user?.followers?.includes(loggedInUserId));
    const [avatar, setAvatar] = useState(user?.profilePhoto);
    const [showFollowList, setShowFollowList] = useState(false);
    const [showLikedPosts, setShowLikedPosts] = useState(false);
    const [followListType, setFollowListType] = useState('');
    const [likedPostsCount, setLikedPostsCount] = useState(0);
    const {id: userId} = useParams()
    const [avatarTouched, setAvatarTouched] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setUser(response?.data)
            setFollowsUser(response?.data?.followers?.includes(loggedInUserId))
            setAvatar(response?.data?.profilePhoto)
        } catch (err) {
            console.error(err);
        }
    }

    const getLikedPostsCount = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/likes`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setLikedPostsCount(response?.data?.length || 0)
        } catch (err) {
            console.error(err);
        }
    }

    const changeAvatarHandler = async (e) => {
        e.preventDefault()
        setAvatarTouched(true)
        try {
            const postData = new FormData()
            postData.set("avatar", avatar)
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/avatar`, postData, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            dispatch(userActions?.changeCurrentUser({...currentUser,profilePhoto: response?.data?.profilePhoto}))
            navigate(0)
        } catch (err) {
            console.error(err)
        }
    }

    const openEditProfileModal = () => {
        dispatch(uiSliceActions.openEditProfileModal())
    }

    const followUnfollowUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/follow-unfollow`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setFollowsUser(response?.data?.followers?.includes(loggedInUserId))
        } catch (err) {
            console.error(err);
        }
    }

    const handleFollowListClick = (type) => {
        setFollowListType(type);
        setShowFollowList(true);
    };

    const handleCloseFollowList = () => {
        setShowFollowList(false);
        setFollowListType('');
    };

    const handleLikedPostsClick = () => {
        setShowLikedPosts(true);
    };

    const handleCloseLikedPosts = () => {
        setShowLikedPosts(false);
    };

    useEffect(() => {
        getUser();
        getLikedPostsCount();
    }, [userId, followsUser, avatar])


    return (
        <section className="profile">
            <div className="profile__container">
                <form className={'profile__image'} onSubmit={changeAvatarHandler} encType={'multipart/form-data'}>
                    <img src={user?.profilePhoto} alt=""/>
                    {!avatarTouched ? <label htmlFor="avatar" className={'profile__image-edit'}>
                        <span><LuUpload/></span>
                    </label> :
                    <button type={'submit'} className={'profile__image-btn'}><FaCheck/></button>}
                    <input type="file" name={'avatar'} id={'avatar'} onChange={e => {setAvatar(e.target.files[0]); setAvatarTouched(true)}} accept={'png, jpg, jpeg, img'} />
                </form>
                <h4>{user?.fullName}</h4>
                <small>{user?.email}</small>
                <ul className="profile__follows">
                    <li onClick={() => handleFollowListClick('following')} style={{ cursor: 'pointer' }}>
                        <h4>{user?.following?.length}</h4>
                        <small>Following</small>
                    </li>
                    <li onClick={() => handleFollowListClick('followers')} style={{ cursor: 'pointer' }}>
                        <h4>{user?.followers?.length}</h4>
                        <small>Followers</small>
                    </li>
                    <li onClick={handleLikedPostsClick} style={{ cursor: 'pointer' }}>
                        <h4>{likedPostsCount}</h4>
                        <small>Likes</small>
                    </li>
                </ul>
                <div className="profile__actions-wrapper">
                    {user?._id == loggedInUserId ? <button className={'btn'} onClick={openEditProfileModal}>Edit Profile</button> : <button onClick={followUnfollowUser} className={'btn dark'}>{followsUser ? "Unfollow" : "Follow"}</button>}
                    {user?._id != loggedInUserId && <Link to={`/messages/${user?._id}`} className={'btn default'}>Message</Link>}
                </div>
                <article className="profile__bio">
                    <p>{user?.bio}</p>
                </article>
            </div>
            <AnimatePresence>
                {showFollowList && (
                    <>
                        <div className="follow-list-overlay" onClick={handleCloseFollowList} />
                        <FollowList
                            type={followListType}
                            userId={userId}
                            onClose={handleCloseFollowList}
                        />
                    </>
                )}
                {showLikedPosts && (
                    <>
                        <div className="liked-posts-overlay" onClick={handleCloseLikedPosts} />
                        <LikedPostsList
                            userId={userId}
                            onClose={handleCloseLikedPosts}
                        />
                    </>
                )}
            </AnimatePresence>
        </section>
    )
}

export default UserProfile;
