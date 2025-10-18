import { useState } from 'react';
import { useStories, type UserStories } from '../contexts/StoriesContext';
import { useAuth } from '../contexts/AuthContext';
import { StoryViewer } from './StoryViewer';

type StoriesBarProps = {
  onAddStory: () => void;
};

export function StoriesBar({ onAddStory }: StoriesBarProps) {
  const { allStories } = useStories();
  useAuth();
  const [selectedUserStories, setSelectedUserStories] = useState<UserStories | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  const handleStoryClick = (userStories: UserStories, storyIndex: number = 0) => {
    setSelectedUserStories(userStories);
    setStartIndex(storyIndex);
  };

  const handleClose = () => {
    setSelectedUserStories(null);
  };

  return (
    <>
      <div className="stories-bar-container">
        <div className="stories-bar">
          <button className="story-item add-story" onClick={onAddStory}>
            <div className="story-avatar">
              <div className="add-story-icon">+</div>
            </div>
            <span className="story-username">Add Story</span>
          </button>

          {allStories.map((userStories) => (
            <button
              key={userStories.userId}
              className="story-item"
              onClick={() => handleStoryClick(userStories)}
            >
              <div className={`story-avatar ${userStories.hasUnviewed ? 'unviewed' : 'viewed'}`}>
                {userStories.userAvatar ? (
                  <img src={userStories.userAvatar} alt={userStories.userName} />
                ) : (
                  <div className="story-avatar-placeholder">
                    {userStories.userName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="story-username">{userStories.userName}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedUserStories && (
        <StoryViewer
          userStories={selectedUserStories}
          startIndex={startIndex}
          onClose={handleClose}
          allUserStories={allStories}
        />
      )}
    </>
  );
}
