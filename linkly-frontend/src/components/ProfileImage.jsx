import React from 'react'

const ProfileImage = ({image, className}) => {
    const defaultImage = "https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png";
    
    return (
        <div className={`profileImage ${className || ''}`}>
            <img 
                src={image || defaultImage} 
                alt="Profile"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                }}
            />
        </div>
    )
}
export default ProfileImage
