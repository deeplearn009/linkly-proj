import React, {useEffect, useState, useRef} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {CiSearch} from "react-icons/ci";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";
import ProfileImage from "../ProfileImage";
import {useSelector, useDispatch} from "react-redux";
import { motion, AnimatePresence } from 'framer-motion';
import {uiSliceActions} from "../../redux/ui-slice";
import axios from "axios";
import { FaSearch, FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
    const userId = useSelector(state => state?.user?.currentUser?.id);
    const currentUser = useSelector(state => state?.user?.currentUser);
    const token = currentUser?.token;
    const theme = useSelector(state => state?.ui?.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/search/users?query=${query}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = () => {
        dispatch(uiSliceActions.logout());
        navigate('/login');
    };

    const toggleTheme = () => {
        dispatch(uiSliceActions.toggleTheme());
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
                
                <motion.div 
                    className={'navbar__search-container'}
                    custom={1}
                    variants={itemVariants}
                >
                    <form className={'navbar__search'} onSubmit={handleSearch}>
                        <input 
                            type="search" 
                            placeholder={'Search users...'} 
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <button type={'submit'}><CiSearch/></button>
                    </form>
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div 
                                className="search-results"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {searchResults.map((result) => (
                                    <Link
                                        key={result._id}
                                        to={`/users/${result._id}`}
                                        className="search-result-item"
                                        onClick={() => setSearchResults([])}
                                    >
                                        <ProfileImage image={result.profilePhoto} />
                                        <div className="search-result-info">
                                            <h4>{result.fullName}</h4>
                                            <small>{result.email}</small>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
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
                            <ProfileImage image={currentUser?.profilePhoto} />
                        </Link>
                    )}
                    {token ? (
                        <button onClick={handleLogout} className="navbar__action">
                            <FaSignOutAlt />
                        </button>
                    ) : (
                        <Link to="/login" className="navbar__action">
                            Login
                        </Link>
                    )}
                </motion.div>
            </div>
        </motion.nav>
    )
}

export default Header;
