import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoryUploader = ({ onClose, onSuccess }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = useSelector(state => state.user.currentUser?.token);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setMediaPreviews(files.map(file => {
      if (file.type.startsWith('video')) {
        return { type: 'video', url: URL.createObjectURL(file) };
      } else {
        return { type: 'image', url: URL.createObjectURL(file) };
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFiles.length) {
      toast.error('Please select at least one image or video');
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    mediaFiles.forEach(file => formData.append('media', file));
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/stories`, formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Stories uploaded!');
      onSuccess && onSuccess();
    } catch (err) {
      toast.error('Failed to upload stories');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="story-uploader-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <form className="story-uploader-modal" style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 320, maxWidth: 400, position: 'relative' }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: 16 }}>Add to Your Story</h3>
        {mediaPreviews.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mediaPreviews.map((preview, idx) => (
              <div key={idx} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {preview.type === 'video' ? (
                  <video src={preview.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src={preview.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} style={{ marginBottom: 16 }} multiple />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: '#eee', border: 'none' }}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: '#2563eb', color: 'white', border: 'none' }}>{isSubmitting ? 'Uploading...' : 'Share'}</button>
        </div>
      </form>
    </div>
  );
};

export default StoryUploader; 