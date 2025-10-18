import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type AdminLoginProps = {
  onLogin: () => void;
};

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === 'admin@privyme.com' && password === 'Admin2025') {
        onLogin();
      } else {
        setError(t('invalidCredentials'));
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="language-toggle">
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

        <div className="admin-login-header">
          <h1>PrivyMe</h1>
          <h2>{t('adminLogin')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@privyme.com"
            />
          </div>

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('loading') : t('signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
