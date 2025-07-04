import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileImage from './ProfileImage';
import { FaTrash, FaEye } from 'react-icons/fa';
import StoryUploader from './StoryUploader';

const StoryViewer = ({ user, onClose }) => {
  const [stories, setStories] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const token = useSelector(state => state.user.currentUser?.token);
  const currentUserId = useSelector(state => state.user.currentUser?.id);
  const timerRef = useRef();

  const fetchUserStories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories/${user._id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories(response.data);
      setCurrent(0);
    } catch (err) {
      setStories([]);
    }
  };

  // Mark as viewed (for extra safety, backend also does this)
  useEffect(() => {
    if (stories.length && stories[current]?._id && currentUserId !== user._id) {
      axios.post(`${import.meta.env.VITE_API_URL}/stories/${stories[current]._id}/view`, {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, [stories, current, currentUserId, user._id, token]);

  useEffect(() => {
    fetchUserStories();
    return () => clearTimeout(timerRef.current);
  }, [user]);

  useEffect(() => {
    if (stories.length > 0) {
      // Only auto-advance for images
      if (stories[current].mediaType === 'image') {
        timerRef.current = setTimeout(() => {
          if (current < stories.length - 1) {
            setCurrent(current + 1);
          } else {
            onClose();
          }
        }, 10000); // 10 seconds for images
        return () => clearTimeout(timerRef.current);
      }
    }
    // Clear timer for videos
    return () => clearTimeout(timerRef.current);
  }, [current, stories, onClose]);

  // Handler for video end
  const handleVideoEnded = () => {
    if (current < stories.length - 1) {
      setCurrent(current + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleNext = () => {
    if (current < stories.length - 1) setCurrent(current + 1);
    else onClose();
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/stories/${storyId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from local list
      const updated = stories.filter(s => s._id !== storyId);
      setStories(updated);
      if (current >= updated.length) setCurrent(Math.max(0, updated.length - 1));
      if (updated.length === 0) onClose();
    } catch (err) {
      alert('Failed to delete story');
    }
  };

  const handleShowViewers = async (storyId) => {
    setIsLoadingViewers(true);
    setShowViewers(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/stories/${storyId}/views`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewers(response.data);
    } catch (err) {
      setViewers([]);
    }
    setIsLoadingViewers(false);
  };

  // When upload is successful, close uploader and refresh stories
  const handleUploadSuccess = () => {
    setShowUploader(false);
    fetchUserStories();
    if (window && window.dispatchEvent) {
      // Notify StoriesBar to refresh (optional, if needed)
      window.dispatchEvent(new Event('stories:refresh'));
    }
  };

  if (!stories.length) return null;

  return (
    <div
      className="story-viewer-overlay"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => {
        // Only close if the click is directly on the overlay, not on children
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="story-viewer-modal" style={{ background: 'rgba(0,0,0,0.95)', borderRadius: 12, padding: 0, minWidth: 580, maxWidth: 700, width: '90vw', maxHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, width: '100%' }}>
          <ProfileImage image={user.profilePhoto} />
          <span style={{ color: 'white', fontWeight: 600 }}>{user.fullName}</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>&times;</button>
          {/* Add Story + button for own stories */}
          {user._id === currentUserId && (
            <button
              title="Add Story"
              onClick={() => setShowUploader(true)}
              style={{ marginLeft: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          )}
        </div>
        {/* Story content */}
        <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Left arrow */}
          {current > 0 && <button onClick={handlePrev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 2 }}>&#8592;</button>}
          {/* Story media */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stories[current]._id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}
            >
              {stories[current].mediaType === 'video' ? (
                <video
                  src={stories[current].mediaUrl}
                  controls
                  autoPlay
                  style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8 }}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <img src={stories[current].mediaUrl} alt="Story" style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8 }} />
              )}
              {/* Delete and Seen-by for own stories */}
              {user._id === currentUserId && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                  <button title="Delete Story" onClick={() => handleDelete(stories[current]._id)} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: 18 }}><FaTrash /></button>
                  <button title="Seen by" onClick={() => handleShowViewers(stories[current]._id)} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: 18 }}><FaEye /></button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {/* Right arrow */}
          {current < stories.length - 1 && <button onClick={handleNext} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 2 }}>&#8594;</button>}
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, width: '100%', padding: '8px 16px' }}>
          {stories.map((s, i) => (
            <div key={s._id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= current ? '#2563eb' : '#444', transition: 'background 0.2s' }} />
          ))}
        </div>
        {/* Seen-by modal */}
        {showViewers && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowViewers(false)}>
            <div style={{ background: '#fff', borderRadius: 12, minWidth: 320, maxWidth: 400, padding: 24, maxHeight: 400, overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <h4 style={{ marginBottom: 12 }}>Seen by</h4>
              <button onClick={() => setShowViewers(false)} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
              {isLoadingViewers ? (
                <div>Loading...</div>
              ) : viewers.length === 0 ? (
                <div style={{ color: '#888' }}>No viewers yet</div>
              ) : (
                Array.from(new Map(viewers.map(v => [v._id, v])).values()).map(v => (
                  <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <ProfileImage image={v.profilePhoto} style={{ width: 32, height: 32 }} />
                    <span>{v.fullName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* StoryUploader modal inside StoryViewer */}
        {showUploader && (
          <StoryUploader onClose={() => setShowUploader(false)} onSuccess={handleUploadSuccess} />
        )}
      </div>
    </div>
  );
};

export default StoryViewer; 