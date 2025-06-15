import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Tag, Spin, Modal, Typography, Space, Avatar } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import TimeAgo from 'react-timeago';

const { Title, Text } = Typography;

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/comments`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to fetch comments');
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      toast.success('Comment deleted successfully');
      fetchComments();
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setSelectedPost(response.data);
      setIsPostModalVisible(true);
    } catch (error) {
      toast.error('Failed to fetch post details');
      console.error('Error fetching post:', error);
    }
  };

  const columns = [
    {
      title: 'Content',
      dataIndex: 'comment',
      key: 'comment',
      width: '40%',
      render: (comment) => (
        <div style={{ maxWidth: '500px' }}>
          <Text ellipsis={{ tooltip: comment }} style={{ margin: 0 }}>
            {comment}
          </Text>
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: ['creator', 'creatorName'],
      key: 'author',
      width: '15%',
      render: (creatorName) => (
        <Tag color="blue">{creatorName}</Tag>
      ),
    },
    {
      title: 'Post',
      dataIndex: ['postId', 'title'],
      key: 'post',
      width: '25%',
      render: (title, record) => (
        <div style={{ maxWidth: '300px' }}>
          <Text ellipsis={{ tooltip: title }} style={{ margin: 0 }}>
            {title}
          </Text>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewPost(record.postId._id)}
            size={window.innerWidth < 768 ? 'small' : 'middle'}
          >
            {window.innerWidth < 768 ? 'View' : 'View Post'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          size={window.innerWidth < 768 ? 'small' : 'middle'}
        >
          {window.innerWidth < 768 ? '' : 'Delete'}
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
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
        Comment Management
      </Title>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="_id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} comments`
        }}
        scroll={{ x: 'max-content' }}
        size={window.innerWidth < 768 ? 'small' : 'middle'}
      />

      <Modal
        title="Post Details"
        open={isPostModalVisible}
        onCancel={() => setIsPostModalVisible(false)}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 800}
        bodyStyle={{ padding: window.innerWidth < 768 ? '12px' : '24px' }}
      >
        {selectedPost && (
          <div style={{ padding: window.innerWidth < 768 ? '12px' : '20px' }}>
            <div style={{ marginBottom: window.innerWidth < 768 ? '12px' : '20px' }}>
              <Space align="start" size={window.innerWidth < 768 ? 'small' : 'middle'}>
                <Avatar 
                  src={selectedPost.creator.profilePhoto} 
                  size={window.innerWidth < 768 ? 48 : 64}
                />
                <div>
                  <Title level={4} style={{ 
                    margin: 0,
                    fontSize: window.innerWidth < 768 ? '16px' : '20px'
                  }}>
                    {selectedPost.title}
                  </Title>
                  <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
                    <Text type="secondary" style={{ 
                      fontSize: window.innerWidth < 768 ? '12px' : '14px'
                    }}>
                      Posted by {selectedPost.creator.fullName}
                    </Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary" style={{ 
                      fontSize: window.innerWidth < 768 ? '12px' : '14px'
                    }}>
                      <TimeAgo date={selectedPost.createdAt} />
                    </Text>
                  </Space>
                </div>
              </Space>
            </div>
            
            <div style={{ 
              padding: window.innerWidth < 768 ? '12px' : '20px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              marginBottom: window.innerWidth < 768 ? '12px' : '20px',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
              <Text>{selectedPost.body}</Text>
            </div>

            {selectedPost.image && (
              <div style={{ marginBottom: window.innerWidth < 768 ? '12px' : '20px' }}>
                {selectedPost.image.endsWith('.mp4') ? (
                  <video 
                    controls 
                    style={{ 
                      width: '100%', 
                      maxHeight: '400px',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  >
                    <source src={selectedPost.image} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={selectedPost.image} 
                    alt="Post" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: '8px',
                      marginBottom: window.innerWidth < 768 ? '8px' : '10px'
                    }} 
                  />
                )}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: window.innerWidth < 768 ? '8px' : '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontSize: window.innerWidth < 768 ? '12px' : '14px'
            }}>
              <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
                <Text type="secondary">{selectedPost.likes?.length || 0} likes</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">{selectedPost.comments?.length || 0} comments</Text>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Comments; 