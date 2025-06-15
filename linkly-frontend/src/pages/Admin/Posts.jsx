import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Space, Modal, Spin, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProfileImage from '../../components/ProfileImage';
import TimeAgo from 'react-timeago';
import LikeDislikePost from '../../components/LikeDislikePost';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoMdShare } from 'react-icons/io';
import BookmarkPost from '../../components/BookmarkPost';

const { Text, Title } = Typography;

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/posts`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to fetch posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'body',
      key: 'title',
      width: '30%',
      render: (body) => (
        <Text ellipsis={{ tooltip: body }} style={{ maxWidth: 300 }}>
          {body}
        </Text>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'creator',
      key: 'author',
      width: '20%',
      render: (creator) => (
        <Text ellipsis={{ tooltip: creator?.fullName }}>
          {creator?.fullName || 'Unknown'}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewPost(record)}
            size={window.innerWidth < 768 ? 'small' : 'middle'}
          >
            {window.innerWidth < 768 ? '' : 'View'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            size={window.innerWidth < 768 ? 'small' : 'middle'}
          >
            {window.innerWidth < 768 ? '' : 'Delete'}
          </Button>
        </Space>
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
        Post Management
      </Title>
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="_id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} posts`
        }}
        scroll={{ x: 'max-content' }}
        size={window.innerWidth < 768 ? 'small' : 'middle'}
      />

      <Modal
        title="Post Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 800}
        className="post-modal"
        bodyStyle={{ padding: window.innerWidth < 768 ? '12px' : '24px' }}
      >
        {selectedPost && (
          <div className="singlePost">
            <header className="feed__header" style={{ 
              padding: window.innerWidth < 768 ? '8px' : '16px',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
              <div className="feed__header-user">
                <ProfileImage image={selectedPost?.creator?.profilePhoto} />
                <h4 style={{ 
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  margin: 0
                }}>
                  {selectedPost?.creator?.fullName}
                </h4>
              </div>
              <small><TimeAgo date={selectedPost?.createdAt} /></small>
            </header>
            <div className="feed__body" style={{ 
              padding: window.innerWidth < 768 ? '8px' : '16px',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
              <p>{selectedPost?.body}</p>
              <div className="feed__media">
                {selectedPost?.mediaType === 'video' ? (
                  <video 
                    src={selectedPost?.image} 
                    controls 
                    className="feed__video"
                    style={{ 
                      maxWidth: '100%',
                      borderRadius: '8px'
                    }}
                  />
                ) : selectedPost?.image && (
                  <img 
                    src={selectedPost?.image} 
                    alt="" 
                    style={{ 
                      maxWidth: '100%',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>
            </div>
            <footer className="feed__footer" style={{ 
              padding: window.innerWidth < 768 ? '8px' : '16px',
              fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
              <div>
                {selectedPost?.likes && <LikeDislikePost post={selectedPost} />}
                <button className="feed__footer-comments">
                  <FaRegCommentDots />
                  <small>{selectedPost?.comments?.length || 0}</small>
                </button>
                <button className="feed__footer-share">
                  <IoMdShare />
                </button>
              </div>
              <BookmarkPost post={selectedPost} />
            </footer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Posts; 