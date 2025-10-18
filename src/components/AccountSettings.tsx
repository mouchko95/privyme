import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function AccountSettings() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile!.id);

      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message || 'Error deleting account');
      setDeleteLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="account-settings">
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-danger"
        >
          Delete Account
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p className="delete-warning">
              This action cannot be undone. This will permanently delete your account,
              including all your messages, conversations, and data.
            </p>
            <div className="form-group">
              <label>Type DELETE to confirm:</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-buttons">
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
                disabled={deleteLoading || confirmText !== 'DELETE'}
              >
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmText('');
                  setError('');
                }}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
