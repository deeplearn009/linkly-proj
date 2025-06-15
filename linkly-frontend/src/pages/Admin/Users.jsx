import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Space, Modal, Select, message, Spin, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';

const { Option } = Select;
const { Title, Text } = Typography;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
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

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '25%',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 250 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size={window.innerWidth < 768 ? 'small' : 'middle'}
          >
            {window.innerWidth < 768 ? '' : 'Edit'}
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
        User Management
      </Title>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`
        }}
        scroll={{ x: 'max-content' }}
        size={window.innerWidth < 768 ? 'small' : 'middle'}
      />

      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        width={window.innerWidth < 768 ? '90%' : '500px'}
      >
        {editingUser && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <label>Role:</label>
              <Select
                value={editingUser.role}
                onChange={(value) => setEditingUser({ ...editingUser, role: value })}
                style={{ width: '100%' }}
                size={window.innerWidth < 768 ? 'small' : 'middle'}
              >
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Users; 