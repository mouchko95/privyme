import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AdminCreators } from './AdminCreators';
import { AdminFans } from './AdminFans';
import { AdminTransactions } from './AdminTransactions';
import { AdminSettings } from './AdminSettings';
import { AdminAnalytics } from './AdminAnalytics';

type AdminPage = 'creators' | 'fans' | 'transactions' | 'analytics' | 'settings';

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPage>('creators');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    window.location.reload();
  };

  return (
    <div className="admin-dashboard">
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2>PrivyMe</h2>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${currentPage === 'creators' ? 'active' : ''}`}
            onClick={() => setCurrentPage('creators')}
          >
            <span className="nav-icon">👥</span>
            {t('creators')}
          </button>
          <button
            className={`admin-nav-item ${currentPage === 'fans' ? 'active' : ''}`}
            onClick={() => setCurrentPage('fans')}
          >
            <span className="nav-icon">⭐</span>
            {t('fans')}
          </button>
          <button
            className={`admin-nav-item ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transactions')}
          >
            <span className="nav-icon">💳</span>
            {t('transactions')}
          </button>
          <button
            className={`admin-nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <span className="nav-icon">📈</span>
            {t('analytics')}
          </button>
          <button
            className={`admin-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            <span className="nav-icon">⚙️</span>
            {t('adminSettings')}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <span className="nav-icon">🚪</span>
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="admin-topbar-right">
            <div className="language-switcher-admin">
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

            <div className="admin-profile">
              <div className="admin-avatar">TM</div>
              <span className="admin-name">Admin Thomas Martin</span>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {currentPage === 'creators' && <AdminCreators />}
          {currentPage === 'fans' && <AdminFans />}
          {currentPage === 'transactions' && <AdminTransactions />}
          {currentPage === 'analytics' && <AdminAnalytics />}
          {currentPage === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
