import React, {useEffect, useState, useRef} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {CiSearch} from "react-icons/ci";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";
import ProfileImage from "../ProfileImage";
import {useSelector, useDispatch} from "react-redux";
import { motion, AnimatePresence } from 'framer-motion';
import {uiSliceActions} from "../../redux/ui-slice";
import axios from "axios";
import { FaSearch, FaHome, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { userActions } from '../../redux/user-slice';
import { notificationActions } from '../../redux/notification-slice';

const Header = () => {
    const userId = useSelector(state => state?.user?.currentUser?.id);
    const currentUser = useSelector(state => state?.user?.currentUser);
    const token = currentUser?.token;
    const theme = useSelector(state => state?.ui?.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const notifications = useSelector(state => state.notification.notifications);
    const unreadCount = useSelector(state => state.notification.unreadCount);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search/users?query=${query}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = () => {
        dispatch(userActions.changeCurrentUser({}));
        localStorage.setItem("currentUser", null);
        navigate('/login');
    };

    const toggleTheme = () => {
        const newBackgroundColor = theme.backgroundColor === "dark" ? "" : "dark";
        dispatch(uiSliceActions.changeTheme({...theme, backgroundColor: newBackgroundColor}));
        localStorage.setItem("theme", JSON.stringify({...theme, backgroundColor: newBackgroundColor}));
    };

    const navVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.3
            }
        })
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/notifications/${notification._id}/read`, {}, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });
                dispatch(notificationActions.markAsRead(notification._id));
            } catch (err) {}
        }
        if ((notification.type === 'like' || notification.type === 'comment') && notification.post) {
            const postId = typeof notification.post === 'string' ? notification.post : notification.post._id;
            if (postId) navigate(`/posts/${postId}`);
        } else if (notification.type === 'follow' && notification.sender) {
            const senderId = typeof notification.sender === 'string' ? notification.sender : notification.sender._id;
            if (senderId) navigate(`/users/${senderId}`);
        } else if (notification.type === 'message' && notification.sender) {
            const senderId = typeof notification.sender === 'string' ? notification.sender : notification.sender._id;
            if (senderId) navigate(`/messages/${senderId}`);
        }
        setShowNotifications(false);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {}, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(notificationActions.markAllAsRead());
        } catch (err) {}
    };

    return (
        <motion.nav 
            className="navbar"
            initial="hidden"
            animate="visible"
            variants={navVariants}
        >
            <div className="container navbar__container">
                <motion.div
                    custom={0}
                    variants={itemVariants}
                >
                    <Link to={'/'} className={'navbar__logo'}>LINKLY</Link>
                </motion.div>
                
                <motion.div 
                    className={'navbar__search-container'}
                    custom={1}
                    variants={itemVariants}
                >
                    <form className={'navbar__search'} onSubmit={handleSearch}>
                        <input 
                            type="search" 
                            placeholder={'Search users...'} 
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <button type={'submit'}><CiSearch/></button>
                    </form>
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div 
                                className="search-results"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {searchResults.map((result) => (
                                    <Link
                                        key={result._id}
                                        to={`/users/${result._id}`}
                                        className="search-result-item"
                                        onClick={() => setSearchResults([])}
                                    >
                                        <ProfileImage image={result.profilePhoto} />
                                        <div className="search-result-info">
                                            <h4>{result.fullName}</h4>
                                            <small>{result.email}</small>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
                <motion.div 
                    className="navbar__right"
                    custom={2}
                    variants={itemVariants}
                >
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme.backgroundColor === "dark" ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                    </button>
                    {currentUser && (
                        <Link to={`/users/${currentUser.id}`} className={'navbar__profile'}>
                            <ProfileImage image={currentUser?.profilePhoto} />
                        </Link>
                    )}
                    {token ? (
                        <button onClick={handleLogout} className="navbar__action">
                            <FaSignOutAlt />
                        </button>
                    ) : (
                        <Link to="/login" className="navbar__action">
                            Login
                        </Link>
                    )}
                    <div className="navbar__notification" ref={notificationRef} style={{ position: 'relative' }}>
                        <button className="navbar__action" onClick={() => setShowNotifications(v => !v)} aria-label="Notifications">
                            <FaBell />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: 'red',
                                    color: 'white',
                                    borderRadius: '50%',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    zIndex: 2
                                }}>{unreadCount}</span>
                            )}
                        </button>
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    className="notification-dropdown"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '2.5rem',
                                        background: 'white',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        minWidth: '320px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        zIndex: 1000
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                                        <span>Notifications</span>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.9rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
                                        )}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '1rem', color: '#888' }}>No notifications</div>
                                    ) : (
                                        notifications.slice(0, 10).map(n => (
                                            <div
                                                key={n._id}
                                                style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f5f5f5', background: n.isRead ? '#fff' : '#e6f7ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                {n.sender && <ProfileImage image={n.sender.profilePhoto} style={{ width: 32, height: 32 }} />}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: n.isRead ? 'normal' : 'bold', fontSize: '0.97rem' }}>
                                                        {n.type === 'like' && <span><b>{n.sender?.fullName || 'Someone'}</b> liked your post.</span>}
                                                        {n.type === 'comment' && <span><b>{n.sender?.fullName || 'Someone'}</b> commented on your post.</span>}
                                                        {n.type === 'follow' && <span><b>{n.sender?.fullName || 'Someone'}</b> followed you.</span>}
                                                        {n.type === 'message' && <span><b>{n.sender?.fullName || 'Someone'}</b> sent you a message.</span>}
                                                        {n.type === 'admin' && <span>Admin notification.</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </motion.nav>
    )
}

export default Header;
