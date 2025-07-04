import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEdit, FaEye, FaUser, FaUserShield } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmModal = async (user) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${deletingUser._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      const { deletedData } = response.data;
      toast.success(
        `User deleted successfully! Removed: ${deletedData.posts} posts, ${deletedData.conversations} conversations, ${deletedData.followers} followers, ${deletedData.following} following`,
        { duration: 5000 }
      );
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Cannot delete this user');
      } else {
        toast.error('Failed to delete user');
      }
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/users/${editingUser._id}`,
        {
          role: editingUser.role,
          isActive: editingUser.isActive
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }
      );
      toast.success('User updated successfully');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">User Management</h2>
      
      <div className="admin-warning">
        <p><strong>Warning:</strong> Deleting a user will permanently remove all their data including posts, comments, conversations, and other related content. This action cannot be undone.</p>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr 
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={user._id === currentUser.id ? 'current-user' : ''}
              >
                <td>
                  <div className="user-info">
                    <span className="user-name">{user.fullName}</span>
                    {user._id === currentUser.id && (
                      <span className="current-user-badge">You</span>
                    )}
                  </div>
                </td>
                <td className="user-email">{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                      disabled={deleteLoading}
                      title="Edit user"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => showDeleteConfirmModal(user)}
                      disabled={deleteLoading || user._id === currentUser.id}
                      title={user._id === currentUser.id ? "Cannot delete your own account" : "Delete user"}
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {isModalVisible && (
          <div className="modal-overlay" onClick={() => setIsModalVisible(false)}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Edit User</h3>
              {editingUser && (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Role:</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setIsModalVisible(false)}>
                      Cancel
                    </button>
                    <button className="btn-save" onClick={handleUpdate}>
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3>Delete User</h3>
              <p>Are you sure you want to delete <strong>{deletingUser?.fullName}</strong>?</p>
              <p>This action will permanently delete:</p>
              <ul>
                <li>All posts by {deletingUser?.fullName}</li>
                <li>All comments by {deletingUser?.fullName}</li>
                <li>All conversations and messages</li>
                <li>All notifications</li>
                <li>All stories</li>
                <li>User's profile and account data</li>
                <li>All references in other users' data</li>
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
                  {deleteLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users; 