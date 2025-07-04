import React from 'react'

const ProfileImage = ({image, className, style}) => {
    const defaultImage = "https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png";
    
    return (
        <div className={`profileImage ${className || ''}`} style={style}>
            <img 
                src={image || defaultImage} 
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', margin: '0 auto' }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                }}
            />
        </div>
    )
}
export default ProfileImage
