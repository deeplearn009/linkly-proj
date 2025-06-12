import React, {useEffect, useState} from 'react'
import {useParams, useNavigate} from "react-router-dom";
import ProfileImage from "../components/ProfileImage.jsx";
import axios from "axios";
import {useSelector} from "react-redux";
import TimeAgo from "react-timeago";
import LikeDislikePost from "../components/LikeDislikePost.jsx";
import {FaRegCommentDots} from "react-icons/fa";
import {IoMdSend, IoMdShare} from "react-icons/io";
import {IoArrowBack} from "react-icons/io5";
import BookmarkPost from "../components/BookmarkPost.jsx";
import PostComment from "../components/PostComment.jsx";

const SinglePost = () => {
    const navigate = useNavigate();
    let {id} = useParams()
    const [post, setPost] = useState({})
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const token = useSelector(state => state?.user?.currentUser?.token)


    const getPost = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${id}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setPost(response?.data)
        } catch (err) {
            console.error('Error fetching post:', err.response?.data || err.message)
            setPost(null)
        }
    }


    const deleteComment = async (commentId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/comments/${commentId}`, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            setComments(comments?.filter(c => c?._id != commentId))
        } catch (err) {
            console.error(err)
        }
    }

    const createComment = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/comments/${id}`, {comment}, {
                withCredentials: true,
                headers: {Authorization: `Bearer ${token}`}
            })
            const newComment = response?.data
            setComments([newComment, ...comments])
        } catch (err) {
            console.error(err)
        }
    }


    useEffect(() => {
        getPost()
    }, [deleteComment])

    return (
        <section className="singlePost">
            <button className="singlePost__back-btn" onClick={() => navigate(-1)}>
                <IoArrowBack />
            </button>
            <header className={'feed__header'}>
                <div className="feed__header-user">
                    <ProfileImage image={post?.creator?.profilePhoto}/>
                    <h4>{post?.creator?.fullName}</h4>
                </div>
                <small><TimeAgo date={post?.createdAt}/></small>
            </header>
            <div className="feed__body">
                <p>{post?.body}</p>
                <div className="feed__images">
                    <img src={post?.image} alt=""/>
                </div>
            </div>
            <footer className="feed__footer">
                <div>
                    {post?.likes && <LikeDislikePost post={post} />}
                    <button className={'feed__footer-comments'}><FaRegCommentDots/></button>
                    <button className={'feed__footer-comments'}><IoMdShare/></button>
                </div>
                <BookmarkPost post={post} />
            </footer>

            <ul className="singlePost__comments">
                <form className="singlePost__comments-form" onSubmit={createComment}>
                    <textarea placeholder={'Enter your comment...'} value={comment} onChange={(e) => setComment(e.target.value)}/>
                    <button type={'submit'} className={'singlePost__comments-btn'}><IoMdSend/></button>
                </form>
                {
                    post?.comments?.map(comment => <PostComment key={comment?._id} comment={comment} onDeleteComment={deleteComment}/>)
                }
            </ul>

        </section>
    )
}
export default SinglePost
