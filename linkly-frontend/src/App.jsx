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

const App = () => {
    return (
        <Provider store={store}>
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
