import { useEffect, useState } from 'react';
import { supabase, type CreatorSettings, type Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function CreatorDashboard() {
  const [settings, setSettings] = useState<CreatorSettings | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [editSettings, setEditSettings] = useState({
    message_price_eur: 1,
    message_price_usd: 1,
    entry_fee_eur: 5,
    entry_fee_usd: 5,
    payout_email: '',
  });
  const { profile } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (profile) {
      fetchCreatorData();
    }
  }, [profile]);

  const fetchCreatorData = async () => {
    const { data: settingsData } = await supabase
      .from('creator_settings')
      .select('*')
      .eq('user_id', profile!.id)
      .maybeSingle();

    if (settingsData) {
      setSettings(settingsData);
      setEditSettings({
        message_price_eur: settingsData.message_price_eur,
        message_price_usd: settingsData.message_price_usd,
        entry_fee_eur: settingsData.entry_fee_eur,
        entry_fee_usd: settingsData.entry_fee_usd,
        payout_email: settingsData.payout_email || '',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('creator_id', profile!.id)
      .gte('created_at', today.toISOString())
      .eq('status', 'completed');

    if (todayTx) {
      const todaySum = todayTx
        .filter((tx: Transaction) => tx.currency === profile?.currency)
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      setTodayEarnings(todaySum);
    }

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: monthTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('creator_id', profile!.id)
      .gte('created_at', monthStart.toISOString())
      .eq('status', 'completed');

    if (monthTx) {
      const monthSum = monthTx
        .filter((tx: Transaction) => tx.currency === profile?.currency)
        .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      setMonthEarnings(monthSum);
    }

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', profile!.id);

    setMessageCount(count || 0);
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('creator_settings')
      .update(editSettings)
      .eq('user_id', profile!.id);

    if (!error) {
      fetchCreatorData();
      setShowSettings(false);
    }
  };

  const requestPayout = async () => {
    if (!settings) return;

    const pendingAmount = profile?.currency === 'EUR' ? settings.pending_payout_eur : settings.pending_payout_usd;
    const minPayout = profile?.currency === 'EUR' ? 10 : 10;

    if (pendingAmount < minPayout) {
      alert(t('minimumPayout'));
      return;
    }

    if (!settings.payout_email) {
      alert('Please set your PayPal email in settings first.');
      return;
    }

    const { error } = await supabase.from('payouts').insert({
      creator_id: profile!.id,
      amount: pendingAmount,
      currency: profile?.currency || 'EUR',
      payout_email: settings.payout_email,
      status: 'pending',
    });

    if (!error) {
      await supabase
        .from('creator_settings')
        .update({
          pending_payout_eur: profile?.currency === 'EUR' ? 0 : settings.pending_payout_eur,
          pending_payout_usd: profile?.currency === 'USD' ? 0 : settings.pending_payout_usd,
        })
        .eq('user_id', profile!.id);

      alert(t('payoutRequested'));
      fetchCreatorData();
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/@${profile?.username}`;
    navigator.clipboard.writeText(link);
    alert(t('linkCopied'));
  };

  const totalEarnings = profile?.currency === 'EUR' ? settings?.total_earnings_eur : settings?.total_earnings_usd;
  const pendingPayout = profile?.currency === 'EUR' ? settings?.pending_payout_eur : settings?.pending_payout_usd;

  return (
    <div className="creator-dashboard">
      <div className="creator-header">
        <h2>{t('dashboard')}</h2>
        <button onClick={() => setShowSettings(true)} className="btn-secondary">
          ⚙️ {t('creatorSettings')}
        </button>
      </div>

      <div className="earnings-grid">
        <div className="earnings-card">
          <div className="earnings-label">{t('today')}</div>
          <div className="earnings-amount">
            {profile?.currency} {todayEarnings.toFixed(2)}
          </div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">{t('thisMonth')}</div>
          <div className="earnings-amount">
            {profile?.currency} {monthEarnings.toFixed(2)}
          </div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">{t('total')}</div>
          <div className="earnings-amount">
            {profile?.currency} {totalEarnings?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('messages')}</div>
          <div className="stat-value">{messageCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('pendingPayout')}</div>
          <div className="stat-value">
            {profile?.currency} {pendingPayout?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={requestPayout} className="btn-primary">
          💰 {t('requestPayout')}
        </button>
        <button onClick={copyInviteLink} className="btn-secondary">
          🔗 {t('copyLink')}
        </button>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('creatorSettings')}</h3>
            <div className="form-group">
              <label>{t('messagePrice')} (EUR)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editSettings.message_price_eur}
                onChange={(e) => setEditSettings({ ...editSettings, message_price_eur: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>{t('messagePrice')} (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editSettings.message_price_usd}
                onChange={(e) => setEditSettings({ ...editSettings, message_price_usd: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>{t('entryFee')} (EUR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editSettings.entry_fee_eur}
                onChange={(e) => setEditSettings({ ...editSettings, entry_fee_eur: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>{t('entryFee')} (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editSettings.entry_fee_usd}
                onChange={(e) => setEditSettings({ ...editSettings, entry_fee_usd: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>{t('payoutEmail')}</label>
              <input
                type="email"
                value={editSettings.payout_email}
                onChange={(e) => setEditSettings({ ...editSettings, payout_email: e.target.value })}
                placeholder="paypal@example.com"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={saveSettings} className="btn-primary">
                {t('save')}
              </button>
              <button onClick={() => setShowSettings(false)} className="btn-secondary">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
