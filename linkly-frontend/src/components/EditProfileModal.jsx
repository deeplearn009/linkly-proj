import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {uiSliceActions} from "../redux/ui-slice.js";
import {userActions} from "../redux/user-slice.js";

const EditProfileModal = () => {

    const [userData, setUserData] = useState({fullName: "", bio: "", website: "", location: "", socialLinks: {twitter: "", facebook: "", instagram: "", linkedin: ""}, theme: "default", profileBackground: ""});
    const [banner, setBanner] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const dispatch = useDispatch();
    const token = useSelector(state => state?.user?.currentUser?.token);
    const id = useSelector(state => state?.user?.currentUser?.id);

    const getUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setUserData({
                ...response?.data,
                socialLinks: response?.data?.socialLinks || {twitter: "", facebook: "", instagram: "", linkedin: ""}
            });
            setBannerPreview(response?.data?.bannerImage || "");
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
            // Update banner if changed
            if (banner) {
                const bannerData = new FormData();
                bannerData.set("banner", banner);
                await axios.post(`${import.meta.env.VITE_API_URL}/users/banner`, bannerData, {
                    withCredentials: true,
                    headers: {Authorization: `Bearer ${token}`},
                });
            }
            // Update other fields
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
        const { name, value } = e.target;
        if (name.startsWith("socialLinks.")) {
            const key = name.split(".")[1];
            setUserData(prevState => ({
                ...prevState,
                socialLinks: {
                    ...prevState.socialLinks,
                    [key]: value
                }
            }));
        } else {
            setUserData(prevState => ({ ...prevState, [name]: value }));
        }
    }

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        setBanner(file);
        if (file) {
            setBannerPreview(URL.createObjectURL(file));
        }
    }

    return (
        <section className={'editProfile'} onClick={e => closeModal(e)}>
            <div className={'editProfile__container'}>
                <h3>Edit Profile</h3>
                <form onSubmit={updateUser}>
                    <input type="text" name={'fullName'} value={userData.fullName} onChange={changeUserData} placeholder={'Full Name'} />
                    <textarea name="bio" value={userData?.bio} onChange={changeUserData} placeholder={'Bio'} ></textarea>
                    <input type="text" name="website" value={userData.website || ""} onChange={changeUserData} placeholder="Website" />
                    <input type="text" name="location" value={userData.location || ""} onChange={changeUserData} placeholder="Location" />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input type="text" name="socialLinks.twitter" value={userData.socialLinks?.twitter || ""} onChange={changeUserData} placeholder="Twitter" />
                        <input type="text" name="socialLinks.facebook" value={userData.socialLinks?.facebook || ""} onChange={changeUserData} placeholder="Facebook" />
                        <input type="text" name="socialLinks.instagram" value={userData.socialLinks?.instagram || ""} onChange={changeUserData} placeholder="Instagram" />
                        <input type="text" name="socialLinks.linkedin" value={userData.socialLinks?.linkedin || ""} onChange={changeUserData} placeholder="LinkedIn" />
                    </div>
                    <button type={'submit'} className={'btn primary'}>Update</button>
                </form>
            </div>
        </section>
    )
}
export default EditProfileModal
