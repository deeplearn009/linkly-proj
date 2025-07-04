import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import ProfileImage from './ProfileImage';
import StoryUploader from './StoryUploader';
import StoryViewer from './StoryViewer';

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const token = useSelector(state => state.user.currentUser?.token);
  const currentUser = useSelector(state => state.user.currentUser);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories(response.data);
    } catch (err) {
      setStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
    // Optionally, poll every 60s for new stories
    // const interval = setInterval(fetchStories, 60000);
    // return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = () => {
    setShowUploader(false);
    fetchStories();
  };

  // Find current user's stories
  const myStoriesGroup = stories.find(g => g.user._id === currentUser?.id);
  const otherStories = stories.filter(g => g.user._id !== currentUser?.id);

  return (
    <div className="stories-bar" style={{ display: 'flex', alignItems: 'center', gap: 16, overflowX: 'auto', padding: '1rem 0' }}>
      {/* Your Story uploader or viewer */}
      {myStoriesGroup ? (
        <div style={{ textAlign: 'center', cursor: 'pointer', minWidth: 90 }} onClick={() => setViewingUser(myStoriesGroup.user)}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '3px solid #2563eb',
            margin: '0 auto',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}>
            <ProfileImage image={myStoriesGroup.user.profilePhoto} style={{ width: '100%', height: '100%' }} />
          </div>
          <div style={{ fontSize: 15, marginTop: 8, fontWeight: 500 }}>Your Story</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', cursor: 'pointer', minWidth: 90 }} onClick={() => setShowUploader(true)}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '3px solid #2563eb' }}>
            <span style={{ fontSize: 40, color: '#2563eb' }}>+</span>
          </div>
          <div style={{ fontSize: 15, marginTop: 8, fontWeight: 500 }}>Your Story</div>
        </div>
      )}
      {/* Other users' stories */}
      {otherStories.map(group => (
        <div key={group.user._id} style={{ textAlign: 'center', cursor: 'pointer', minWidth: 90 }} onClick={() => setViewingUser(group.user)}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '3px solid #2563eb',
            margin: '0 auto',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}>
            <ProfileImage image={group.user.profilePhoto} style={{ width: '100%', height: '100%' }} />
          </div>
          <div style={{ fontSize: 15, marginTop: 8, fontWeight: 500 }}>{group.user.fullName.split(' ')[0]}</div>
        </div>
      ))}
      {/* Uploader Modal */}
      {showUploader && <StoryUploader onClose={() => setShowUploader(false)} onSuccess={handleUploadSuccess} />}
      {/* Story Viewer Modal */}
      {viewingUser && <StoryViewer user={viewingUser} onClose={() => { setViewingUser(null); fetchStories(); }} />}
    </div>
  );
};

export default StoriesBar; 