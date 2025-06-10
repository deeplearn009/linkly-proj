import React from 'react'

const ProfileImage = ({image, className}) => {

    console.log(image)

    return (
        <div className={`profileImage ${className}`}>
            <img src={image} alt=""/>
        </div>
    )
}
export default ProfileImage
