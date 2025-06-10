import React from 'react'
import {Link} from "react-router-dom";
import styles from './Header.module.scss'
import {CiSearch} from "react-icons/ci";
import ProfileImage from "../ProfileImage.jsx";
import {useSelector} from "react-redux";

const Header = () => {

    const userId = useSelector(state => state?.user?.currentUser?.id);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);



    return (
        <div className={styles.container}>
            <header>
                <Link to='/' className={styles.logo}>
                    <img src="https://res.cloudinary.com/deaqvu2on/image/upload/v1749554737/Adobe_Express_-_file_e6cpan.png" alt="Logo"/>
                </Link>
                <form className={styles.search}>
                    <input type="search" placeholder="Search here..." />
                </form>
                <div className="navbar__right">

                    <Link to={`/users/${userId}`}>
                        <ProfileImage image={profilePhoto}/>
                    </Link>
                    {token ? <Link to={'/logout'}>Logout</Link> : <Link to={'/login'}>Login</Link>}

                </div>
            </header>
        </div>
    )
}
export default Header
