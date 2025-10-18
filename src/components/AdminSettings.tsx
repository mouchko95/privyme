import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function AdminSettings() {
  const [commission, setCommission] = useState(10);
  const [newCommission, setNewCommission] = useState('10');
  const [userEmail, setUserEmail] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleUpdateCommission = () => {
    const value = parseFloat(newCommission);
    if (isNaN(value) || value < 0 || value > 100) {
      setError('Commission must be between 0 and 100%');
      return;
    }
    setCommission(value);
    setMessage(t('commissionUpdated'));
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddCredits = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!userEmail || !creditAmount) {
      setError('Please fill all fields');
      return;
    }

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Credit amount must be greater than 0');
      return;
    }

    setMessage(t('creditsAdded'));
    setUserEmail('');
    setCreditAmount('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{t('adminSettings')}</h1>

      <div className="admin-settings-grid">
        <div className="admin-card">
          <h3>{t('currentCommission')}</h3>
          <div className="commission-display">{commission}%</div>

          <div className="form-group">
            <label>{t('modifyCommission')}</label>
            <input
              type="number"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <button onClick={handleUpdateCommission} className="btn-primary">
            {t('save')}
          </button>
        </div>

        <div className="admin-card">
          <h3>{t('giveFreeCredits')}</h3>

          <form onSubmit={handleAddCredits}>
            <div className="form-group">
              <label>{t('userEmail')}</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>{t('creditAmount')}</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="50.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              {t('addFreeCredits')}
            </button>
          </form>
        </div>
      </div>

      {message && <div className="success-message-admin">{message}</div>}
      {error && <div className="error-message-admin">{error}</div>}
    </div>
  );
}
