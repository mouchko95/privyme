import { useState, useEffect, useRef } from 'react';
import { supabase, type CreatorSettings } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AccountSettings } from './AccountSettings';

export function ProfileEdit() {
  const { profile, refreshProfile } = useAuth();
  const { t, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    language: 'en' as 'en' | 'fr',
    currency: 'EUR' as 'EUR' | 'USD',
  });

  const [creatorSettings, setCreatorSettings] = useState<CreatorSettings | null>(null);
  const [creatorPrices, setCreatorPrices] = useState({
    message_price_eur: 1,
    message_price_usd: 1,
    entry_fee_eur: 5,
    entry_fee_usd: 5,
    payout_email: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        language: profile.language,
        currency: profile.currency,
      });

      if (profile.role === 'creator') {
        fetchCreatorSettings();
      }
    }
  }, [profile]);

  const fetchCreatorSettings = async () => {
    const { data } = await supabase
      .from('creator_settings')
      .select('*')
      .eq('user_id', profile!.id)
      .maybeSingle();

    if (data) {
      setCreatorSettings(data);
      setCreatorPrices({
        message_price_eur: data.message_price_eur,
        message_price_usd: data.message_price_usd,
        entry_fee_eur: data.entry_fee_eur,
        entry_fee_usd: data.entry_fee_usd,
        payout_email: data.payout_email || '',
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile!.id}/${Date.now()}.${fileExt}`;

      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData({ ...formData, avatar_url: publicUrl });
      setMessage('Avatar uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    await uploadAvatar(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          language: formData.language,
          currency: formData.currency,
        })
        .eq('id', profile!.id);

      if (profileError) throw profileError;

      if (profile?.role === 'creator' && creatorSettings) {
        const { error: creatorError } = await supabase
          .from('creator_settings')
          .update({
            message_price_eur: creatorPrices.message_price_eur,
            message_price_usd: creatorPrices.message_price_usd,
            entry_fee_eur: creatorPrices.entry_fee_eur,
            entry_fee_usd: creatorPrices.entry_fee_usd,
            payout_email: creatorPrices.payout_email,
          })
          .eq('user_id', profile.id);

        if (creatorError) throw creatorError;
      }

      setLanguage(formData.language);
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!formData.avatar_url) return;

    try {
      setUploading(true);
      const oldPath = formData.avatar_url.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile!.id);

      if (error) throw error;

      setFormData({ ...formData, avatar_url: '' });
      await refreshProfile();
      setMessage('Avatar deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Error deleting avatar');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="profile-edit">
      <div className="profile-edit-header">
        <h2>{t('profile')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="avatar-section">
          <div className="avatar-preview" onClick={handleAvatarClick}>
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.display_name[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="avatar-overlay">
              {uploading ? '⏳' : '📷'}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="avatar-actions">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="btn-secondary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </button>
            {formData.avatar_url && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="btn-danger"
                disabled={uploading}
              >
                Delete Avatar
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>{t('displayName')}</label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            required
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            maxLength={200}
            rows={4}
          />
          <small>{formData.bio.length}/200</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('language')}</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'fr' })}
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('currency')}</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'EUR' | 'USD' })}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>

        {profile.role === 'creator' && creatorSettings && (
          <>
            <div className="creator-pricing-section">
              <h3>Creator Pricing</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('messagePrice')} (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={creatorPrices.message_price_eur}
                    onChange={(e) => setCreatorPrices({ ...creatorPrices, message_price_eur: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('messagePrice')} (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={creatorPrices.message_price_usd}
                    onChange={(e) => setCreatorPrices({ ...creatorPrices, message_price_usd: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('entryFee')} (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={creatorPrices.entry_fee_eur}
                    onChange={(e) => setCreatorPrices({ ...creatorPrices, entry_fee_eur: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('entryFee')} (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={creatorPrices.entry_fee_usd}
                    onChange={(e) => setCreatorPrices({ ...creatorPrices, entry_fee_usd: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('payoutEmail')}</label>
                <input
                  type="email"
                  value={creatorPrices.payout_email}
                  onChange={(e) => setCreatorPrices({ ...creatorPrices, payout_email: e.target.value })}
                  placeholder="paypal@example.com"
                />
              </div>
            </div>
          </>
        )}

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t('loading') : t('save')}
        </button>
      </form>

      <AccountSettings />
    </div>
  );
}
