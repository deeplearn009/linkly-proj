import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Statistic, List, Avatar, Typography, Spin, Tag, Progress, Alert } from 'antd';
import { UserOutlined, CommentOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import { Column } from '@ant-design/plots';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector(state => state.user.currentUser);
  const isAdmin = useSelector(state => state.user.isAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || !isAdmin) {
      navigate('/login');
      return;
    }
    fetchStats();
    fetchRecentActivities();
  }, [currentUser, isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard statistics';
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/users?limit=5`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/posts?limit=5`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/comments?limit=5`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        })
      ]);

      const activities = [
        ...usersResponse.data.map(user => ({
          type: 'user',
          data: user,
          timestamp: user.createdAt
        })),
        ...postsResponse.data.map(post => ({
          type: 'post',
          data: post,
          timestamp: post.createdAt
        })),
        ...commentsResponse.data.map(comment => ({
          type: 'comment',
          data: comment,
          timestamp: comment.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
       .slice(0, 10);

      setRecentActivities(activities);
    } catch (error) {
      toast.error('Failed to fetch recent activities');
      console.error('Error fetching activities:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'post':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'comment':
        return <CommentOutlined style={{ color: '#722ed1' }} />;
      default:
        return null;
    }
  };

  const getActivityTitle = (activity) => {
    switch (activity.type) {
      case 'user':
        return `New user registered: ${activity.data.fullName}`;
      case 'post':
        return `New post created: ${activity.data.body.substring(0, 50)}${activity.data.body.length > 50 ? '...' : ''}`;
      case 'comment':
        return `New comment on post: ${activity.data.comment.substring(0, 50)}${activity.data.comment.length > 50 ? '...' : ''}`;
      default:
        return '';
    }
  };

  const getChartData = () => {
    if (!stats) return [];
    return [
      { type: 'Users', count: stats.totalUsers, color: '#1890ff' },
      { type: 'Posts', count: stats.totalPosts, color: '#52c41a' },
      { type: 'Comments', count: stats.totalComments, color: '#722ed1' }
    ];
  };

  const chartConfig = {
    data: [
      { type: 'Users', count: stats?.totalUsers || 0 },
      { type: 'Posts', count: stats?.totalPosts || 0 },
      { type: 'Comments', count: stats?.totalComments || 0 },
    ],
    xField: 'type',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      type: { alias: 'Category' },
      count: { alias: 'Count' },
    },
    color: ['#1890ff', '#52c41a', '#722ed1'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    height: window.innerWidth < 768 ? 200 : 300,
    autoFit: true,
    padding: 'auto',
  };

  const getMaxValue = () => {
    if (!stats) return 100;
    return Math.max(stats.totalUsers, stats.totalPosts, stats.totalComments);
  };

  if (!currentUser || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ padding: '16px' }}>
      <Title level={2} style={{ 
        marginBottom: '24px',
        fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem',
        textAlign: 'center'
      }}>
        Dashboard
      </Title>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: '12px' }}>
            <div style={{ 
              textAlign: 'center', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: window.innerWidth < 768 ? '140px' : '180px'
            }}>
              <Progress
                type="circle"
                percent={Math.round((stats?.totalUsers / getMaxValue()) * 100)}
                format={() => (
                  <div style={{ 
                    width: window.innerWidth < 768 ? '80px' : '100px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <UserOutlined style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      color: '#1890ff' 
                    }} />
                    <div style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      fontWeight: 'bold', 
                      marginTop: '4px' 
                    }}>
                      {stats?.totalUsers}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: window.innerWidth < 768 ? '10px' : '12px',
                      marginTop: '2px' 
                    }}>
                      Users
                    </div>
                  </div>
                )}
                strokeColor="#1890ff"
                size={window.innerWidth < 768 ? 120 : 140}
                strokeWidth={10}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: '12px' }}>
            <div style={{ 
              textAlign: 'center', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: window.innerWidth < 768 ? '140px' : '180px'
            }}>
              <Progress
                type="circle"
                percent={Math.round((stats?.totalPosts / getMaxValue()) * 100)}
                format={() => (
                  <div style={{ 
                    width: window.innerWidth < 768 ? '80px' : '100px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <FileTextOutlined style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      color: '#52c41a' 
                    }} />
                    <div style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      fontWeight: 'bold', 
                      marginTop: '4px' 
                    }}>
                      {stats?.totalPosts}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: window.innerWidth < 768 ? '10px' : '12px',
                      marginTop: '2px' 
                    }}>
                      Posts
                    </div>
                  </div>
                )}
                strokeColor="#52c41a"
                size={window.innerWidth < 768 ? 120 : 140}
                strokeWidth={10}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bodyStyle={{ padding: '12px' }}>
            <div style={{ 
              textAlign: 'center', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: window.innerWidth < 768 ? '140px' : '180px'
            }}>
              <Progress
                type="circle"
                percent={Math.round((stats?.totalComments / getMaxValue()) * 100)}
                format={() => (
                  <div style={{ 
                    width: window.innerWidth < 768 ? '80px' : '100px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <CommentOutlined style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      color: '#722ed1' 
                    }} />
                    <div style={{ 
                      fontSize: window.innerWidth < 768 ? '16px' : '20px',
                      fontWeight: 'bold', 
                      marginTop: '4px' 
                    }}>
                      {stats?.totalComments}
                    </div>
                    <div style={{ 
                      color: '#666', 
                      fontSize: window.innerWidth < 768 ? '10px' : '12px',
                      marginTop: '2px' 
                    }}>
                      Comments
                    </div>
                  </div>
                )}
                strokeColor="#722ed1"
                size={window.innerWidth < 768 ? 120 : 140}
                strokeWidth={10}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title="Statistics Overview" 
            bodyStyle={{ padding: '12px' }}
            headStyle={{ 
              padding: '12px 24px',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Column {...chartConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title="Recent Activity" 
        style={{ marginTop: '24px' }}
        headStyle={{ 
          padding: '12px 24px',
          fontSize: window.innerWidth < 768 ? '14px' : '16px'
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={recentActivities}
          renderItem={activity => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={getActivityIcon(activity.type)}
                title={
                  <div style={{ 
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    lineHeight: '1.4'
                  }}>
                    {getActivityTitle(activity)}
                  </div>
                }
                description={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '4px'
                  }}>
                    <Tag color={
                      activity.type === 'user' ? 'blue' :
                      activity.type === 'post' ? 'green' :
                      'purple'
                    }>
                      {activity.type.toUpperCase()}
                    </Tag>
                    <TimeAgo date={activity.timestamp} />
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 