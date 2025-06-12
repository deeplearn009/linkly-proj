import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {uiSliceActions} from "../redux/ui-slice.js";
import {userActions} from "../redux/user-slice.js";

const EditProfileModal = () => {

    const [userData, setUserData] = useState({fullName: "", bio: ""});
    const dispatch = useDispatch();
    const token = useSelector(state => state?.user?.currentUser?.token);
    const id = useSelector(state => state?.user?.currentUser?.id);

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setUserData(response?.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getUser();
    }, [])

    const closeModal = (e) => {
        if(e.target.classList.contains('editProfile')) {
            dispatch(uiSliceActions?.closeEditProfileModal());
        }
    }

    const updateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/users/${id}`, userData, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            dispatch(userActions.changeCurrentUser({...response.data, token, id}))
            localStorage.setItem("currentUser", JSON.stringify({...response.data, token, id}))
            closeModal(e)
        } catch (err) {
            console.error(err);
        }
    }

    const changeUserData = (e) => {
        setUserData(prevState => {
            return {...prevState, [e.target.name]: e.target.value};
        });
    }

    return (
        <section className={'editProfile'} onClick={e => closeModal(e)}>
            <div className={'editProfile__container'}>
                <h3>Edit Profile</h3>
                <form onSubmit={updateUser}>
                    <input type="text" name={'fullName'} value={userData.fullName} onChange={changeUserData} placeholder={'Full Name'} />
                    <textarea name="bio" value={userData?.bio} onChange={changeUserData} placeholder={'Bio'} ></textarea>
                    <button type={'submit'} className={'btn primary'}>Update</button>
                </form>
            </div>
        </section>
    )
}
export default EditProfileModal
