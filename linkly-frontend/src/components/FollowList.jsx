import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { ImSpinner8 } from 'react-icons/im';
import toast from 'react-hot-toast';

const FollowList = ({ type, userId, onClose }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const currentUserId = useSelector(state => state?.user?.currentUser?.id);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/${userId}/${type}`,
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setUsers(response.data);
            } catch (err) {
                console.error(err);
                toast.error(`Failed to fetch ${type}`);
            }
            setIsLoading(false);
        };

        fetchUsers();
    }, [userId, type, token]);

    const handleRemoveFollower = async (followerId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/users/${followerId}/remove-follower`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsers(users.filter(user => user._id !== followerId));
            toast.success('Follower removed successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove follower');
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/users/${userId}`);
        onClose();
    };

    return (
        <div className="follow-list">
            <div className="follow-list__header">
                <h3>{type === 'followers' ? 'Followers' : 'Following'}</h3>
                <button onClick={onClose} className="follow-list__close">
                    <IoClose />
                </button>
            </div>
            <div className="follow-list__content">
                {isLoading ? (
                    <div className="follow-list__loading">
                        <ImSpinner8 className="spinner" />
                        <p>Loading {type}...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="follow-list__empty">
                        <FaUserCircle size={48} />
                        <p>No {type} found</p>
                        <small>When someone follows you or you follow someone, they'll appear here.</small>
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user._id} className="follow-list__user">
                            <div 
                                className="follow-list__user-info"
                                onClick={() => handleUserClick(user._id)}
                            >
                                <img 
                                    src={user.profilePhoto || 'https://via.placeholder.com/48'} 
                                    alt={user.fullName}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/48';
                                    }}
                                />
                                <div>
                                    <h4>{user.fullName}</h4>
                                    <small>{user.email}</small>
                                </div>
                            </div>
                            {type === 'followers' && user._id !== currentUserId && (
                                <button
                                    className="follow-list__remove"
                                    onClick={() => handleRemoveFollower(user._id)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FollowList; 