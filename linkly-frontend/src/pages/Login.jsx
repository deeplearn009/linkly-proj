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
    const navigate = useNavigate()
    const dispatch = useDispatch()



    // Change user data
    const changeInputHandler = (e) => {
        setUserData(prevState => ({...prevState, [e.target.name]: e.target.value}))
    }

    //Login user
    const loginUser = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Logging in...');
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, userData)

            if(response.status == 200) {
                dispatch(userActions.changeCurrentUser(response?.data))
                localStorage.setItem("currentUser", JSON.stringify(response?.data))
                toast.success('Successfully logged in!', {
                    id: loadingToast,
                });
                navigate("/")
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed', {
                id: loadingToast,
            });
            setError(err.response?.data?.message)
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
                    >
                        Login
                    </motion.button>
                </motion.form>
            </div>
        </motion.section>
    )
}
export default Login
