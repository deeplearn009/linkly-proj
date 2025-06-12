import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {uiSliceActions} from "../redux/ui-slice.js";
import toast from 'react-hot-toast';

const EditPostModal = ({onUpdatePost}) => {
    const dispatch = useDispatch();
    const editPostId = useSelector(state => state?.ui?.editPostId);
    const token = useSelector(state => state?.user?.currentUser?.token);
    const [body, setBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${editPostId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`},
            })
            setBody(response?.data?.body);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load post');
            dispatch(uiSliceActions?.closeEditPostModal());
        }
    }

    useEffect(() => {
        getPost();
    }, [editPostId])

    const updatePost = async (e) => {
        e.preventDefault();
        if (!body.trim()) {
            toast.error('Post cannot be empty');
            return;
        }
        
        setIsSubmitting(true);
        const postData = new FormData();
        postData.set("body", body);
        onUpdatePost(postData, editPostId);
        dispatch(uiSliceActions?.closeEditPostModal());
    }

    const closeEditPostModal = (e) => {
        if (e.target.classList.contains('editPost')) {
            dispatch(uiSliceActions?.closeEditPostModal());
        }
    }

    return (
        <form className={'editPost'} onSubmit={updatePost} onClick={closeEditPostModal}>
            <div className="editPost__container" onClick={e => e.stopPropagation()}>
                <textarea 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)} 
                    placeholder="Write a post..." 
                    autoFocus
                />
                <button 
                    type={'submit'} 
                    className={'btn primary'}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Updating...' : 'Update Post'}
                </button>
            </div>
        </form>
    )
}
export default EditPostModal
