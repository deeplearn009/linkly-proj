import React, {useEffect, useState} from 'react'
import {useSelector} from "react-redux";
import TimeAgo from "react-timeago";
import {FaRegTrashAlt} from "react-icons/fa";
import axios from "axios";
import ProfileImage from "./ProfileImage.jsx";

const PostComment = ({comment, onDeleteComment}) => {
    const token = useSelector(state => state?.user?.currentUser?.token)
    const userId = useSelector(state => state?.user?.currentUser?.id)



    const deleteComment = () => {
        onDeleteComment(comment?._id)
    }


    return (
        <li className="singlePost__comment">
            <div className="singlePost__comment-content">
                <div className="singlepost__comment-wrapper">
                    <div className="singlePost__comment-author">
                        <ProfileImage image={comment?.creator?.creatorPhoto || comment?.creator?.profilePhoto} />
                    </div>
                    <div className="singlePost__comment-header">
                        <h5>{comment?.creator?.creatorName || comment?.creator?.fullName}</h5>
                        <small><TimeAgo date={comment?.createdAt}/></small>
                    </div>
                </div>
                <div className="singlePost__comment-body">
                    <p>{comment?.comment}</p>
                </div>
            </div>
            {userId == comment?.creator?.creatorId && <button className={'singlePost__comment-delete-btn'} onClick={deleteComment}><FaRegTrashAlt/></button>}
        </li>
    )
}
export default PostComment
