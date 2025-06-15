import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedAdminRoute = ({ children }) => {
    const currentUser = useSelector(state => state.user.currentUser);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (currentUser.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedAdminRoute; 