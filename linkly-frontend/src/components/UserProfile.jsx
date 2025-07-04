import React, {useEffect, useState} from 'react'
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate, useParams} from "react-router-dom";
import {LuUpload} from "react-icons/lu";
import {FaCheck, FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaGlobe} from "react-icons/fa6";
import {FaMapMarkerAlt} from "react-icons/fa";
import {userActions} from "../redux/user-slice.js";
import {uiSliceActions} from "../redux/ui-slice.js";
import FollowList from "./FollowList.jsx";
import LikedPostsList from "./LikedPostsList.jsx";
import { AnimatePresence } from 'framer-motion';

const UserProfile = () => {

    const token = useSelector(state => state?.user?.currentUser?.token)
    const loggedInUserId = useSelector(state => state?.user?.currentUser?.id)
    const currentUser = useSelector(state => state?.user?.currentUser)
    const reduxUser = useSelector(state => state.user.currentUser);

    const [user, setUser] = useState({});
    const [followsUser, setFollowsUser] = useState(user?.followers?.includes(loggedInUserId));
    const [avatar, setAvatar] = useState(null);
    const [showFollowList, setShowFollowList] = useState(false);
    const [showLikedPosts, setShowLikedPosts] = useState(false);
    const [followListType, setFollowListType] = useState('');
    const [likedPostsCount, setLikedPostsCount] = useState(0);
    const {id: userId} = useParams()
    const [avatarTouched, setAvatarTouched] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const DEFAULT_AVATAR = "https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png";

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setUser(response?.data)
            setFollowsUser(response?.data?.followers?.includes(loggedInUserId))
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
        e.preventDefault();
        setAvatarTouched(true);
        if (!(avatar instanceof File)) return; // Only submit if avatar is a File
        try {
            const postData = new FormData();
            postData.append("avatar", avatar);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/avatar`, postData, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            });
            dispatch(userActions?.changeCurrentUser({...currentUser,profilePhoto: response?.data?.profilePhoto}));
            setAvatar(null); // Reset avatar after upload
            setAvatarTouched(false);
            navigate(0);
        } catch (err) {
            console.error(err);
        }
    }

    const removeAvatarHandler = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/users/avatar`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(userActions?.changeCurrentUser({ ...currentUser, profilePhoto: DEFAULT_AVATAR }));
            setAvatar(null);
            setAvatarTouched(false);
            navigate(0);
        } catch (err) {
            console.error(err);
        }
    };

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

    // Sync with Redux user if viewing own profile
    useEffect(() => {
        if (userId === reduxUser?.id || userId === reduxUser?._id) {
            setUser(reduxUser);
        }
    }, [reduxUser, userId]);

    return (
        <section className="profile">
            <div className="profile__container">
                {/* Avatar and Remove Button Column */}
                <div className="profile__avatar-row">
                  <div className="profile__avatar-container">
                    <div className="profile__image">
                      <img src={user?.profilePhoto} alt="" />
                      {user?._id === loggedInUserId && (
                        <form onSubmit={changeAvatarHandler} encType="multipart/form-data">
                          {avatar instanceof File ? (
                            <button type="submit" className="profile__image-btn profile__image-btn--check"><FaCheck /></button>
                          ) : (
                            <label htmlFor="avatar" className="profile__image-edit">
                              <span><LuUpload /></span>
                            </label>
                          )}
                          <input type="file" name="avatar" id="avatar" onChange={e => {setAvatar(e.target.files[0]); setAvatarTouched(true)}} accept=".png, .jpg, .jpeg, .img" style={{ display: 'none' }} />
                        </form>
                      )}
                    </div>
                    {user?._id === loggedInUserId && user?.profilePhoto && user?.profilePhoto !== DEFAULT_AVATAR && (
                      <button
                        type="button"
                        className="profile__remove-btn"
                        onClick={removeAvatarHandler}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
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
                <div className="profile__extra-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    {user?.website && (
                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaGlobe /> {user.website}</a>
                    )}
                    {user?.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FaMapMarkerAlt /> {user.location}</div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                        {user?.socialLinks?.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>}
                        {user?.socialLinks?.facebook && <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook /></a>}
                        {user?.socialLinks?.instagram && <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
                        {user?.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>}
                    </div>
                </div>
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

