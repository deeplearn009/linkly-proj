import React, {useState} from 'react'
import {Link, useNavigate} from "react-router-dom";
import {FaEye, FaSlash} from "react-icons/fa";
import axios from "axios";

const Register = () => {

    const [userData, setUserData] = useState({fullName: "", email: "", password: "", confirmPassword: ""})
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()


    // Change user data
    const changeInputHandler = (e) => {
        setUserData(prevState => ({...prevState, [e.target.name]: e.target.value}))
    }

    //Reg user
    const registerUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, userData)
            if(response.statusText == "OK") {
                navigate("/login")
            }
        } catch (err) {
            setError(err.response?.data?.message)
        }
    }


    return (
        <section className='register'>
            <div className='container register__container'>
                <h2>Sign Up</h2>
                <form onSubmit={registerUser}>
                    {error && <p className="form__error-message">
                        {error}
                    </p>}
                    <input type="text" name='fullName' placeholder='Fullname' onChange={changeInputHandler}
                           autoFocus={true}/>
                    <input type="text" name='email' placeholder='Email' onChange={changeInputHandler}/>
                    <div className="password__controller">
                        <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Password'
                               onChange={changeInputHandler}/>
                        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaSlash/> :
                            <FaEye/>}</span>
                    </div>
                    <div className="password__controller">
                        <input type={showPassword ? 'text' : 'password'} name='confirmPassword'
                               placeholder='Confirm Password' onChange={changeInputHandler}/>
                        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaSlash/> :
                            <FaEye/>}</span>
                    </div>
                    <p>Already have an account? <Link to={'/login'}>Sign in</Link></p>
                    <button type={'submit'} className={'btn primary'}>Register</button>
                </form>
            </div>
        </section>
    )
}
export default Register
