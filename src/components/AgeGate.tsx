import { useLanguage } from '../contexts/LanguageContext';

type AgeGateProps = {
  onConfirm: () => void;
  onDecline: () => void;
};

export function AgeGate({ onConfirm, onDecline }: AgeGateProps) {
  const { t } = useLanguage();

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <h1 className="age-gate-title">{t('ageGateTitle')}</h1>
        <p className="age-gate-message">{t('ageGateMessage')}</p>
        <div className="age-gate-buttons">
          <button className="btn-primary" onClick={onConfirm}>
            {t('ageGateConfirm')}
          </button>
          <button className="btn-secondary" onClick={onDecline}>
            {t('ageGateDecline')}
          </button>
        </div>
      </div>
    </div>
  );
}
