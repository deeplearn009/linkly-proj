import React from 'react'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import RootLayout from "./components/layout/RootLayout.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import MessagesList from "./components/MessagesList.jsx";
import Messages from "./pages/Messages.jsx";
import Bookmarks from "./pages/Bookmarks.jsx";
import Profile from "./pages/Profile.jsx";
import SinglePost from "./pages/SinglePost.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Logout from "./pages/Logout.jsx";
import {Provider} from "react-redux";
import store from "./redux/store/store.js";
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Comments from './pages/Admin/Comments';
import Posts from './pages/Admin/Posts';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from './redux/user-slice.js';
import { useEffect } from 'react';
import socketService from './services/socketService.js';
import { notificationActions } from './redux/notification-slice.js';
import axios from 'axios';

const router = createBrowserRouter([
    {
        path: '/', element: <RootLayout/>, errorElement: <ErrorPage/>, children: [
            {index: true, element: <Home/>},
            {path: 'messages', element: <MessagesList/>},
            {path: 'messages/:receiverId', element: <Messages/>},
            {path: 'bookmarks', element: <Bookmarks/>},
            {path: 'users/:id', element: <Profile/>},
            {path: 'posts/:id', element: <SinglePost/>},
        ]
    },
    {
        path: '/admin',
        element: (
            <ProtectedAdminRoute>
                <AdminLayout/>
            </ProtectedAdminRoute>
        ),
        children: [
            {index: true, element: <Dashboard/>},
            {path: 'users', element: <Users/>},
            {path: 'comments', element: <Comments/>},
            {path: 'posts', element: <Posts/>},
        ]
    },
    {path: '/login', element: <Login/>},
    {path: '/register', element: <Register/>},
    {path: '/logout', element: <Logout/>},
])

// Separate component for socket logic that can use Redux hooks
const SocketManager = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.currentUser);

    useEffect(() => {
        const userId = currentUser?.id || currentUser?._id;
        const token = currentUser?.token;

        // Fetch notifications on login
        const fetchNotifications = async () => {
            if (userId && token) {
                dispatch(notificationActions.setLoading(true));
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    dispatch(notificationActions.setNotifications(response.data));
                } catch (err) {
                    // Optionally handle error
                } finally {
                    dispatch(notificationActions.setLoading(false));
                }
            }
        };
        fetchNotifications();

        if (userId && token) {
            (async () => {
                try {
                    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:6060';
                    const cleanUrl = socketUrl.replace(/\/$/, '').replace(/\/socket\.io.*$/, '').replace(/\/api.*$/, '');
                    socketService.connect(userId);
                } catch (error) {}
            })();
        } else {
            socketService.disconnect();
        }

        // Set up socket event listeners
        const handleConnection = (data) => {
            dispatch(userActions.setSocketConnected(data.connected));
        };
        const handleOnlineUsers = (onlineUsers) => {
            dispatch(userActions.setOnlineUsers(onlineUsers));
        };
        // Handle real-time notification
        const handleNotification = (notification) => {
            dispatch(notificationActions.addNotification(notification));
        };

        socketService.on('connection', handleConnection);
        socketService.on('onlineUsers', handleOnlineUsers);
        socketService.on('notification', handleNotification);

        return () => {
            socketService.off('connection', handleConnection);
            socketService.off('onlineUsers', handleOnlineUsers);
            socketService.off('notification', handleNotification);
            socketService.disconnect();
            dispatch(userActions.setSocketConnected(false));
        };
    }, [currentUser?.id, currentUser?._id, currentUser?.token, dispatch]);

    return null;
};

const App = () => {
    useEffect(() => {
        if (window.Notification && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
    return (
        <Provider store={store}>
            <SocketManager />
            <AnimatePresence mode="wait">
                <RouterProvider router={router}/>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            theme: {
                                primary: '#4aed88',
                            },
                        },
                    }}
                />
            </AnimatePresence>
        </Provider>
    )
}
export default App
