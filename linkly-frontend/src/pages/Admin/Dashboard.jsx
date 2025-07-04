import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaUsers, FaComments, FaFileAlt, FaChartLine, FaClock, FaUserPlus, FaComment, FaFileAlt as FaPost } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/recent-activities`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setActivitiesError('Failed to load recent activities');
    } finally {
      setActivitiesLoading(false);
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <FaUserPlus />;
      case 'comment':
        return <FaComment />;
      case 'post':
        return <FaPost />;
      default:
        return <FaClock />;
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'user_registration':
        return `${activity.userName} joined the platform`;
      case 'comment':
        return `${activity.userName} commented on a post`;
      case 'post':
        return `${activity.userName} created a new post`;
      default:
        return 'Activity occurred';
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <FaUsers />,
      color: '#3b82f6'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts || 0,
      icon: <FaFileAlt />,
      color: '#10b981'
    },
    {
      title: 'Total Comments',
      value: stats.totalComments || 0,
      icon: <FaComments />,
      color: '#f59e0b'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: <FaChartLine />,
      color: '#8b5cf6'
    }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            className="admin-stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ borderLeft: `4px solid ${card.color}` }}
          >
            <div className="stats-card-header">
              <div className="stats-card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="stats-card-content">
                <h3 className="stats-card-title">{card.title}</h3>
                <p className="stats-card-value">{card.value.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="admin-activities-section">
        <h3 className="section-title">Recent Activities</h3>
        <div className="activities-list">
          {activitiesLoading ? (
            <div className="no-activities">
              <div className="admin-spinner"></div>
              <p>Loading activities...</p>
            </div>
          ) : activitiesError ? (
            <div className="no-activities">
              <p style={{ color: '#ef4444' }}>{activitiesError}</p>
              <button 
                onClick={fetchRecentActivities}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Retry
              </button>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p className="activity-title">{getActivityTitle(activity)}</p>
                  <small className="activity-time">
                    {new Date(activity.createdAt).toLocaleString()}
                  </small>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="no-activities">
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 