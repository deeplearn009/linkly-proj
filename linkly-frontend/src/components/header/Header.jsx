import React, {useEffect, useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {CiSearch} from "react-icons/ci";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";
import ProfileImage from "../ProfileImage.jsx";
import {useSelector, useDispatch} from "react-redux";
import { motion } from 'framer-motion';
import {uiSliceActions} from "../../redux/ui-slice.js";
import axios from "axios";

const Header = () => {
    const [user, setuser] = useState({})
    const userId = useSelector(state => state?.user?.currentUser?.id)
    const currentUser = useSelector(state => state?.user?.currentUser);
    const token = currentUser?.token;
    // const profilePhoto = currentUser?.profilePhoto;
    const theme = useSelector(state => state?.ui?.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setuser(response?.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getUser()
    }, [])


    useEffect(() => {
        if(!token){
            navigate("/login");
        }
    }, [token, navigate])

    useEffect(() => {
        if(token) {
            setTimeout(() => {
                navigate("/logout");
            }, 1000 * 60 * 60)
        }
    }, [token, navigate])

    const toggleTheme = () => {
        const newBackgroundColor = theme.backgroundColor === "dark" ? "" : "dark";
        dispatch(uiSliceActions.changeTheme({...theme, backgroundColor: newBackgroundColor}));
        localStorage.setItem("theme", JSON.stringify({...theme, backgroundColor: newBackgroundColor}));
    };

    const navVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.3
            }
        })
    };

    return (
        <motion.nav 
            className="navbar"
            initial="hidden"
            animate="visible"
            variants={navVariants}
        >
            <div className="container navbar__container">
                <motion.div
                    custom={0}
                    variants={itemVariants}
                >
                    <Link to={'/'} className={'navbar__logo'}>LINKLY</Link>
                </motion.div>
                
                <motion.form 
                    className={'navbar__search'}
                    custom={1}
                    variants={itemVariants}
                >
                    <input type="search" placeholder={'Search...'} />
                    <button type={'submit'}><CiSearch/></button>
                </motion.form>
                
                <motion.div 
                    className="navbar__right"
                    custom={2}
                    variants={itemVariants}
                >
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme.backgroundColor === "dark" ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                    </button>
                    {currentUser && (
                        <Link to={`/users/${currentUser.id}`} className={'navbar__profile'}>
                            <ProfileImage image={user?.profilePhoto} />
                        </Link>
                    )}
                    {token ? <Link to={'/logout'}>Logout</Link> : <Link to={'/login'}>Login</Link>}
                </motion.div>
            </div>
        </motion.nav>
    )
}
export default Header
