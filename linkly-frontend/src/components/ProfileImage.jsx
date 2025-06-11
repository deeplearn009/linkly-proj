import React from 'react'

const ProfileImage = ({image, className}) => {




    return (
        <div className={`profileImage ${className}`}>
            <img src={image || "https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png"} alt=""/>
        </div>
    )
}
export default ProfileImage
