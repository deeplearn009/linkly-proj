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
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="story-viewer-modal" onClick={e => e.stopPropagation()}>
        {/* User info */}
        <div className="story-viewer-header">
          <ProfileImage image={user.profilePhoto} />
          <span className="story-viewer-username">{user.fullName}</span>
          <button className="story-viewer-close" onClick={onClose}>&times;</button>
          {user._id === currentUserId && (
            <button
              title="Add Story"
              className="story-viewer-add"
              onClick={() => setShowUploader(true)}
            >
              +
            </button>
          )}
        </div>
        {/* Story content */}
        <div className="story-viewer-content">
          {current > 0 && <button className="story-viewer-arrow left" onClick={handlePrev}>&#8592;</button>}
          <AnimatePresence mode="wait">
            <motion.div
              key={stories[current]._id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="story-viewer-media-wrapper"
            >
              {stories[current].mediaType === 'video' ? (
                <video
                  src={stories[current].mediaUrl}
                  controls
                  autoPlay
                  className="story-viewer-media"
                  onEnded={handleVideoEnded}
                />
              ) : (
                <img src={stories[current].mediaUrl} alt="Story" className="story-viewer-media" />
              )}
              {user._id === currentUserId && (
                <div className="story-viewer-actions">
                  <button title="Delete Story" onClick={() => handleDelete(stories[current]._id)} className="story-viewer-action-btn"><FaTrash /></button>
                  <button title="Seen by" onClick={() => handleShowViewers(stories[current]._id)} className="story-viewer-action-btn"><FaEye /></button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {current < stories.length - 1 && <button className="story-viewer-arrow right" onClick={handleNext}>&#8594;</button>}
        </div>
        {/* Progress bar */}
        <div className="story-viewer-progress">
          {stories.map((s, i) => (
            <div key={s._id} className={`story-viewer-progress-bar${i <= current ? ' active' : ''}`} />
          ))}
        </div>
        {/* Seen-by modal */}
        {showViewers && (
          <div className="story-viewer-seenby-overlay" onClick={() => setShowViewers(false)}>
            <div className="story-viewer-seenby-modal" onClick={e => e.stopPropagation()}>
              <h4>Seen by</h4>
              <button className="story-viewer-seenby-close" onClick={() => setShowViewers(false)}>&times;</button>
              {isLoadingViewers ? (
                <div>Loading...</div>
              ) : viewers.length === 0 ? (
                <div style={{ color: '#888' }}>No viewers yet</div>
              ) : (
                Array.from(new Map(viewers.map(v => [v._id, v])).values()).map(v => (
                  <div key={v._id} className="story-viewer-seenby-user">
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