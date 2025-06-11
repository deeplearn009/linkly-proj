import React, {useEffect} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {CiSearch} from "react-icons/ci";
import ProfileImage from "../ProfileImage.jsx";
import {useSelector} from "react-redux";
import { motion } from 'framer-motion';

const Header = () => {
    const userId = useSelector(state => state?.user?.currentUser?.id);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);
    const navigate = useNavigate();

    useEffect(() => {
        if(!token){
            navigate("/login");
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            navigate("/logout");
        }, 1000 * 60 * 60)
    }, [])

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
                    <Link to={`/users/${userId}`} className={'navbar__profile'}>
                        <ProfileImage image={profilePhoto}/>
                    </Link>
                    {token ? <Link to={'/logout'}>Logout</Link> : <Link to={'/login'}>Login</Link>}
                </motion.div>
            </div>
        </motion.nav>
    )
}
export default Header
