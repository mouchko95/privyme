import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Story = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  createdAt: number;
  expiresAt: number;
  viewed: boolean;
};

export type UserStories = {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
};

type StoriesContextType = {
  allStories: UserStories[];
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'viewed'>) => void;
  markStoryAsViewed: (storyId: string) => void;
  removeExpiredStories: () => void;
};

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'privyme_stories';

const generateId = () => `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const loadStoriesFromStorage = (): Story[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoriesToStorage = (stories: Story[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch (error) {
    console.error('Error saving stories:', error);
  }
};

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const loadedStories = loadStoriesFromStorage();
    const now = Date.now();
    const validStories = loadedStories.filter(story => story.expiresAt > now);
    setStories(validStories);
    saveStoriesToStorage(validStories);
  }, []);

  useEffect(() => {
    saveStoriesToStorage(stories);
  }, [stories]);

  const removeExpiredStories = () => {
    const now = Date.now();
    const validStories = stories.filter(story => story.expiresAt > now);
    setStories(validStories);
  };

  const addStory = (newStory: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'viewed'>) => {
    const now = Date.now();
    const story: Story = {
      ...newStory,
      id: generateId(),
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
      viewed: false,
    };
    setStories(prev => [...prev, story]);
  };

  const markStoryAsViewed = (storyId: string) => {
    setStories(prev =>
      prev.map(story =>
        story.id === storyId ? { ...story, viewed: true } : story
      )
    );
  };

  const allStories: UserStories[] = stories.reduce((acc, story) => {
    const existingUser = acc.find(u => u.userId === story.userId);
    if (existingUser) {
      existingUser.stories.push(story);
      if (!story.viewed) {
        existingUser.hasUnviewed = true;
      }
    } else {
      acc.push({
        userId: story.userId,
        userName: story.userName,
        userAvatar: story.userAvatar,
        stories: [story],
        hasUnviewed: !story.viewed,
      });
    }
    return acc;
  }, [] as UserStories[]);

  allStories.forEach(userStories => {
    userStories.stories.sort((a, b) => a.createdAt - b.createdAt);
  });

  return (
    <StoriesContext.Provider value={{ allStories, addStory, markStoryAsViewed, removeExpiredStories }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
}
