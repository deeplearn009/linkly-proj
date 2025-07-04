import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEye, FaComment } from 'react-icons/fa';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const showDeleteConfirmModal = (comment) => {
    setDeletingComment(comment);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingComment) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/comments/${deletingComment._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      toast.success('Comment deleted successfully');
      fetchComments();
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeletingComment(null);
    }
  };

  const handleViewPost = async (postId) => {
    if (!postId) {
      toast.error('Post not found');
      return;
    }
    window.open(`/posts/${postId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">Comment Management</h2>
      
      <div className="admin-warning">
        <p><strong>Warning:</strong> Deleting a comment will permanently remove it. This action cannot be undone.</p>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>Post</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <motion.tr 
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <td>
                  <div className="comment-author">
                    <span className="author-name">{comment.creator?.fullName || 'Unknown'}</span>
                    <small className="author-email">{comment.creator?.email}</small>
                  </div>
                </td>
                <td>
                  <div className="comment-content">
                    <p className="comment-text">{comment.comment?.substring(0, 100)}{comment.comment?.length > 100 ? '...' : ''}</p>
                  </div>
                </td>
                <td>
                  <div className="comment-post">
                    <span className="post-title">
                      {comment.postId?.body?.substring(0, 50) || 'Post not found'}
                      {comment.postId?.body?.length > 50 ? '...' : ''}
                    </span>
                    <small className="post-author">by {comment.postId?.creator?.fullName || 'Unknown'}</small>
                  </div>
                </td>
                <td>{new Date(comment.createdAt).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewPost(comment.postId?._id)}
                      disabled={!comment.postId?._id}
                      title={comment.postId?._id ? "View post" : "Post not found"}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => showDeleteConfirmModal(comment)}
                      disabled={deleteLoading}
                      title="Delete comment"
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
              <h3>Delete Comment</h3>
              <p>Are you sure you want to delete this comment by <strong>{deletingComment?.creator?.fullName}</strong>?</p>
              <p>This action will permanently delete:</p>
              <ul>
                <li>The comment content</li>
                <li>All replies to this comment (if any)</li>
                <li>All likes on this comment (if any)</li>
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
                  {deleteLoading ? 'Deleting...' : 'Delete Comment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comments; 