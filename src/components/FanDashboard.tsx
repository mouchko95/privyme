import { useEffect, useState } from 'react';
import { supabase, type FanWallet } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const CREDIT_PACKAGES = [
  { amount: 10, credits: 10 },
  { amount: 25, credits: 25 },
  { amount: 50, credits: 50 },
  { amount: 100, credits: 100 },
];

export function FanDashboard() {
  const [wallet, setWallet] = useState<FanWallet | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [canBecomeCreator, setCanBecomeCreator] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (profile) {
      fetchWallet();
      setCanBecomeCreator(profile.role === 'fan');
    }
  }, [profile]);

  const fetchWallet = async () => {
    const { data } = await supabase
      .from('fan_wallets')
      .select('*')
      .eq('user_id', profile!.id)
      .maybeSingle();
    setWallet(data);
  };

  const becomeCreator = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'creator' })
      .eq('id', profile!.id);

    if (!error) {
      await refreshProfile();
    }
  };

  const purchaseCredits = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!wallet) return;

    alert(`In production, this would integrate with Stripe/PayPal to purchase ${pkg.amount} ${profile?.currency} worth of credits.`);

    const { error } = await supabase
      .from('fan_wallets')
      .update({
        credits_eur: profile?.currency === 'EUR' ? wallet.credits_eur + pkg.credits : wallet.credits_eur,
        credits_usd: profile?.currency === 'USD' ? wallet.credits_usd + pkg.credits : wallet.credits_usd,
      })
      .eq('user_id', profile!.id);

    if (!error) {
      await supabase.from('transactions').insert({
        user_id: profile!.id,
        type: 'credit_purchase',
        amount: pkg.amount,
        currency: profile?.currency || 'EUR',
        platform_fee: 0,
        status: 'completed',
        payment_method: 'stripe',
      });

      fetchWallet();
      setShowPurchase(false);
    }
  };

  const credits = profile?.currency === 'EUR' ? wallet?.credits_eur : wallet?.credits_usd;

  return (
    <div className="fan-dashboard">
      <h2>{t('wallet')}</h2>

      <div className="wallet-card">
        <div className="wallet-balance">
          <div className="balance-label">{t('credits')}</div>
          <div className="balance-amount">
            {credits?.toFixed(2)} {profile?.currency}
          </div>
        </div>
        <button onClick={() => setShowPurchase(true)} className="btn-primary">
          {t('addCredits')}
        </button>
      </div>

      {canBecomeCreator && (
        <div className="become-creator-card">
          <h3>{t('becomeCreator')}</h3>
          <p>Start earning money by chatting with your fans!</p>
          <button onClick={becomeCreator} className="btn-primary">
            {t('becomeCreator')}
          </button>
        </div>
      )}

      {showPurchase && (
        <div className="modal-overlay" onClick={() => setShowPurchase(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('purchaseCredits')}</h3>
            <p>{t('selectPackage')}</p>
            <div className="credit-packages">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => purchaseCredits(pkg)}
                  className="package-card"
                >
                  <div className="package-amount">{pkg.amount} {profile?.currency}</div>
                  <div className="package-credits">{pkg.credits} {t('credits')}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPurchase(false)} className="btn-secondary">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
