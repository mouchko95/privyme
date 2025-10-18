import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Creator = {
  id: string;
  name: string;
  email: string;
  numberOfFans: number;
  creditBalance: number;
  registrationDate: string;
};

const mockCreators: Creator[] = [
  { id: 'C001', name: 'Sophie Durand', email: 'sophie@example.com', numberOfFans: 245, creditBalance: 1250.50, registrationDate: '2024-01-15' },
  { id: 'C002', name: 'Marie Lefebvre', email: 'marie@example.com', numberOfFans: 189, creditBalance: 890.25, registrationDate: '2024-02-03' },
  { id: 'C003', name: 'Emma Garcia', email: 'emma@example.com', numberOfFans: 312, creditBalance: 2100.00, registrationDate: '2024-01-28' },
  { id: 'C004', name: 'Laura Martinez', email: 'laura@example.com', numberOfFans: 156, creditBalance: 675.80, registrationDate: '2024-03-10' },
  { id: 'C005', name: 'Julie Bernard', email: 'julie@example.com', numberOfFans: 421, creditBalance: 3200.45, registrationDate: '2023-12-20' },
];

export function AdminCreators() {
  const [creators] = useState<Creator[]>(mockCreators);
  const { t } = useLanguage();

  const handleViewProfile = (creator: Creator) => {
    alert(`View profile: ${creator.name} (${creator.email})`);
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{t('creators')}</h1>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('numberOfFans')}</th>
              <th>{t('creditBalance')}</th>
              <th>{t('registrationDate')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => (
              <tr key={creator.id}>
                <td>{creator.id}</td>
                <td>{creator.name}</td>
                <td>{creator.email}</td>
                <td>{creator.numberOfFans}</td>
                <td>€{creator.creditBalance.toFixed(2)}</td>
                <td>{new Date(creator.registrationDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => handleViewProfile(creator)}
                  >
                    {t('viewProfile')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
