import React, {useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {FaEye, FaSlash} from "react-icons/fa";
import axios from "axios";
import {useDispatch} from "react-redux";
import {userActions} from "../redux/user-slice.js";
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
    const [userData, setUserData] = useState({email: "", password: ""})
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // Change user data
    const changeInputHandler = (e) => {
        setUserData(prevState => ({...prevState, [e.target.name]: e.target.value}))
        setError('') // Clear error when user types
    }

    //Login user
    const loginUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Validate input
        if (!userData.email || !userData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const loadingToast = toast.loading('Logging in...');
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, userData)

            if(response.status === 200) {
                const { token, ...userData } = response.data;
                
                // Store user data with token in localStorage
                const userDataWithToken = {
                    ...userData,
                    token
                };
                
                // Update Redux store
                dispatch(userActions.changeCurrentUser(userDataWithToken));
                
                // Store in localStorage
                localStorage.setItem("currentUser", JSON.stringify(userDataWithToken));
                
                toast.success('Successfully logged in!', {
                    id: loadingToast,
                });
                
                // Redirect based on user role
                if (userData.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage, {
                id: loadingToast,
            });
            setError(errorMessage);
            dispatch(userActions.setError(errorMessage));
        } finally {
            setIsLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <motion.section 
            className='register'
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className='container register__container'>
                <motion.h2 variants={itemVariants}>Sign In</motion.h2>
                <motion.form onSubmit={loginUser} variants={itemVariants}>
                    {error && <motion.p 
                        className="form__error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {error}
                    </motion.p>}
                    <motion.input 
                        type="text" 
                        name='email' 
                        placeholder='Email' 
                        onChange={changeInputHandler}
                        variants={itemVariants}
                        disabled={isLoading}
                    />
                    <motion.div 
                        className="password__controller"
                        variants={itemVariants}
                    >
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            name='password' 
                            placeholder='Password'
                            onChange={changeInputHandler}
                            disabled={isLoading}
                        />
                        <motion.span 
                            onClick={() => setShowPassword(!showPassword)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {showPassword ? <FaSlash/> : <FaEye/>}
                        </motion.span>
                    </motion.div>
                    <motion.p variants={itemVariants}>
                        Dont have an account? <Link to={'/register'}>Sign Up</Link>
                    </motion.p>
                    <motion.button 
                        type={'submit'} 
                        className={'btn primary'}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </motion.form>
            </div>
        </motion.section>
    )
}
export default Login
