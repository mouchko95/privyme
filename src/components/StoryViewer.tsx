import { useState, useEffect, useRef } from 'react';
import { useStories, type UserStories } from '../contexts/StoriesContext';

type StoryViewerProps = {
  userStories: UserStories;
  startIndex: number;
  onClose: () => void;
  allUserStories: UserStories[];
};

export function StoryViewer({ userStories, startIndex, onClose, allUserStories }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(startIndex);
  const [currentUserIndex, setCurrentUserIndex] = useState(
    allUserStories.findIndex(us => us.userId === userStories.userId)
  );
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { markStoryAsViewed } = useStories();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentUserStories = allUserStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];
  const totalStories = currentUserStories?.stories.length || 0;

  const STORY_DURATION = 5000;

  useEffect(() => {
    if (!currentStory) return;

    markStoryAsViewed(currentStory.id);

    setProgress(0);

    if (currentStory.mediaType === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }

    if (!isPaused) {
      startProgress();
    }

    return () => {
      stopProgress();
    };
  }, [currentStory?.id, isPaused]);

  const startProgress = () => {
    stopProgress();
    const duration = currentStory?.mediaType === 'video' && videoRef.current
      ? videoRef.current.duration * 1000
      : STORY_DURATION;

    const interval = 50;
    const increment = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          goToNext();
          return 0;
        }
        return next;
      });
    }, interval);
  };

  const stopProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const goToNext = () => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (currentUserIndex < allUserStories.length - 1) {
        setCurrentUserIndex(prev => prev + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        onClose();
      }
    }
  };

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      if (currentUserIndex > 0) {
        setCurrentUserIndex(prev => prev - 1);
        const prevUserStories = allUserStories[currentUserIndex - 1];
        setCurrentStoryIndex(prevUserStories.stories.length - 1);
        setProgress(0);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrevious();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoryIndex, currentUserIndex]);

  const handleVideoEnded = () => {
    goToNext();
  };

  const handleMouseDown = () => {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMouseUp = () => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  if (!currentStory) return null;

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="story-close" onClick={onClose}>
          ✕
        </button>

        <div className="story-header">
          <div className="story-user-info">
            <div className="story-user-avatar">
              {currentUserStories.userAvatar ? (
                <img src={currentUserStories.userAvatar} alt={currentUserStories.userName} />
              ) : (
                <div className="story-avatar-placeholder-small">
                  {currentUserStories.userName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="story-user-name">{currentUserStories.userName}</div>
              <div className="story-time">{timeAgo(currentStory.createdAt)}</div>
            </div>
          </div>

          <div className="story-progress-bars">
            {currentUserStories.stories.map((_, index) => (
              <div key={index} className="story-progress-bar">
                <div
                  className="story-progress-fill"
                  style={{
                    width: index < currentStoryIndex
                      ? '100%'
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="story-content"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
        >
          <div className="story-nav story-nav-left" onClick={(e) => { e.stopPropagation(); goToPrevious(); }} />
          <div className="story-nav story-nav-right" onClick={(e) => { e.stopPropagation(); goToNext(); }} />

          {currentStory.mediaType === 'image' ? (
            <img src={currentStory.mediaUrl} alt="Story" className="story-media" />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="story-media"
              onEnded={handleVideoEnded}
              playsInline
              muted
            />
          )}
        </div>
      </div>
    </div>
  );
}
