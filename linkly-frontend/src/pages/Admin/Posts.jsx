import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const showDeleteConfirmModal = (post) => {
    setDeletingPost(post);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/posts/${deletingPost._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeletingPost(null);
    }
  };

  const handleViewPost = (post) => {
    window.open(`/posts/${post._id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">Post Management</h2>
      
      <div className="admin-warning">
        <p><strong>Warning:</strong> Deleting a post will permanently remove it and all associated comments. This action cannot be undone.</p>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Content</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <motion.tr 
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <td>
                  <div className="post-author">
                    <span className="author-name">{post.creator?.fullName || 'Unknown'}</span>
                    <small className="author-email">{post.creator?.email}</small>
                  </div>
                </td>
                <td>
                  <div className="post-content">
                    <p className="post-body">{post.body?.substring(0, 100)}{post.body?.length > 100 ? '...' : ''}</p>
                    {post.image && (
                      <span className="post-has-media">
                        <FaFileAlt /> Has Media
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="post-likes">{post.likes?.length || 0}</span>
                </td>
                <td>
                  <span className="post-comments">{post.comments?.length || 0}</span>
                </td>
                <td>{new Date(post.createdAt).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewPost(post)}
                      title="View post"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => showDeleteConfirmModal(post)}
                      disabled={deleteLoading}
                      title="Delete post"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div 
              className="modal-content delete-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete Post</h3>
              <p>Are you sure you want to delete this post by <strong>{deletingPost?.creator?.fullName}</strong>?</p>
              <p>This action will permanently delete:</p>
              <ul>
                <li>The post content</li>
                <li>All comments on this post</li>
                <li>All likes on this post</li>
                <li>Any media associated with the post</li>
              </ul>
              <p><strong>This action cannot be undone!</strong></p>
              <div className="modal-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button 
                  className="btn-delete-confirm" 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Posts; 