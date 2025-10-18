import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { FanDashboard } from './FanDashboard';
import { CreatorDashboard } from './CreatorDashboard';
import { ProfileEdit } from './ProfileEdit';
import { StoriesBar } from './StoriesBar';
import { StoryUpload } from './StoryUpload';
import { Wallet } from './Wallet';
import { type Conversation, type Profile } from '../lib/supabase';

type ConversationWithProfiles = Conversation & {
  fan: Profile;
  creator: Profile;
};

export function Dashboard() {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<ConversationWithProfiles | null>(null);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const { profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const activeTab = location.pathname.slice(1) || 'conversations';

  useEffect(() => {
    console.log('📍 Current route:', location.pathname);

    const routes = ['/conversations', '/dashboard', '/wallet', '/profile'];
    if (routes.includes(location.pathname)) {
      console.log('✅ Navigation OK - Route accessible and clickable');
    }
  }, [location.pathname]);

  if (!profile) return null;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">PrivyMe</h1>
        </div>

        <div className="profile-section">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile.display_name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name">{profile.display_name}</div>
            <div className="profile-username">@{profile.username}</div>
            <div className="profile-role">{profile.role}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/conversations"
            className={`nav-item ${activeTab === 'conversations' ? 'active' : ''}`}
          >
            💬 {t('chats')}
          </Link>
          <Link
            to="/dashboard"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            📊 {t('dashboard')}
          </Link>
          <Link
            to="/wallet"
            className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
          >
            💰 {t('wallet')}
          </Link>
          <Link
            to="/profile"
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          >
            👤 {t('profile')}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="language-switcher-small">
            <button
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              className={language === 'fr' ? 'active' : ''}
              onClick={() => setLanguage('fr')}
            >
              FR
            </button>
          </div>
          <button onClick={signOut} className="btn-secondary">
            {t('signOut')}
          </button>
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'conversations' ? (
          selectedChat ? (
            <ChatWindow
              conversation={selectedChat}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <>
              <StoriesBar onAddStory={() => setShowStoryUpload(true)} />
              <ChatList onSelectChat={setSelectedChat} />
            </>
          )
        ) : activeTab === 'wallet' ? (
          <Wallet />
        ) : activeTab === 'profile' ? (
          <ProfileEdit />
        ) : profile.role === 'creator' ? (
          <CreatorDashboard />
        ) : (
          <FanDashboard />
        )}
      </div>

      {showStoryUpload && <StoryUpload onClose={() => setShowStoryUpload(false)} />}
    </div>
  );
}
