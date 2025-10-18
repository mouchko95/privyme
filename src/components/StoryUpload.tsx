import { useState, useRef } from 'react';
import { useStories } from '../contexts/StoriesContext';
import { useAuth } from '../contexts/AuthContext';

type StoryUploadProps = {
  onClose: () => void;
};

export function StoryUpload({ onClose }: StoryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addStory } = useStories();
  const { profile } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setMediaType('image');
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Video must be less than 50MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        setMediaType('video');

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current && videoRef.current.duration > 15) {
                setError('Video must be 15 seconds or less');
                setPreview(null);
                setMediaType(null);
              }
            };
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload an image or video file');
    }
  };

  const handleUpload = () => {
    if (!preview || !mediaType || !profile) return;

    setUploading(true);

    addStory({
      userId: profile.id,
      userName: profile.display_name,
      userAvatar: profile.avatar_url || '',
      mediaType,
      mediaUrl: preview,
    });

    setTimeout(() => {
      setUploading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content story-upload-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add to Your Story</h3>

        {!preview ? (
          <div className="story-upload-area" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-icon">📸</div>
            <p>Click to upload photo or video</p>
            <small>Max 10MB for images, 50MB for videos (15s max)</small>
          </div>
        ) : (
          <div className="story-preview">
            {mediaType === 'image' ? (
              <img src={preview} alt="Preview" />
            ) : (
              <video ref={videoRef} src={preview} controls />
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="modal-buttons">
          {preview && (
            <>
              <button onClick={handleUpload} className="btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Add Story'}
              </button>
              <button
                onClick={() => {
                  setPreview(null);
                  setMediaType(null);
                  setError('');
                }}
                className="btn-secondary"
              >
                Choose Different
              </button>
            </>
          )}
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
