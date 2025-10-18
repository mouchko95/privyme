import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { creditPacks, getPackById, type CreditPack } from '../config/pricing';

async function createCheckoutSession(
  packId: string,
  userId: string,
  userEmail: string
): Promise<{ url: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      packId,
      userId,
      userEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

export function Wallet() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile, user } = useAuth();
  const [balance, setBalance] = useState(25);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US').format(num);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const packId = params.get('pack');

    if (success === '1' && packId) {
      const pack = getPackById(packId);
      if (pack) {
        setBalance((prev) => prev + pack.credits);
        setMessageType('success');
        setMessage(t('creditsAddedSuccess'));

        navigate('/wallet', { replace: true });

        setTimeout(() => {
          setMessage('');
        }, 5000);
      }
    } else if (canceled === '1') {
      setMessageType('error');
      setMessage(t('paymentCanceled'));

      navigate('/wallet', { replace: true });

      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [location.search, navigate, t]);

  const handleBuyPack = async (pack: CreditPack) => {
    if (!profile) {
      setMessageType('error');
      setMessage('Please log in to purchase credits');
      return;
    }

    setProcessing(pack.id);
    setMessage('');

    try {
      const { url } = await createCheckoutSession(
        pack.id,
        profile.id,
        user?.email || 'user@privyme.com'
      );

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Failed to start checkout');
      setProcessing(null);
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>{t('wallet')}</h1>
      </div>

      <div className="balance-card">
        <div className="balance-label">{t('yourBalance')}</div>
        <div className="balance-amount">
          {formatNumber(balance)}
        </div>
      </div>

      <div className="wallet-section">
        <h2>{t('buyCredits')}</h2>
        <p className="section-description">{t('creditPacks')}</p>
      </div>

      <div className="credit-packages">
        {creditPacks.map((pack) => (
          <div
            key={pack.id}
            className={`credit-package ${pack.popular ? 'popular' : ''}`}
          >
            {pack.popular && (
              <div className="popular-badge">
                {language === 'fr' ? 'Populaire' : 'Popular'}
              </div>
            )}
            <div className="package-credits">
              {formatNumber(pack.credits)}
            </div>
            <div className="package-credits-label">{t('credits')}</div>
            <div className="package-price">{pack.price}€</div>
            <button
              className="btn-primary package-button"
              onClick={() => handleBuyPack(pack)}
              disabled={processing !== null}
            >
              {processing === pack.id ? t('purchaseProcessing') : t('buy')}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div className={`wallet-message wallet-message-${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}
