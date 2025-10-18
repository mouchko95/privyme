import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Fan = {
  id: string;
  name: string;
  email: string;
  remainingCredits: number;
  lastCreatorContacted: string;
};

const mockFans: Fan[] = [
  { id: 'F001', name: 'Pierre Dubois', email: 'pierre@example.com', remainingCredits: 45.50, lastCreatorContacted: 'Sophie Durand' },
  { id: 'F002', name: 'Jean Martin', email: 'jean@example.com', remainingCredits: 120.00, lastCreatorContacted: 'Marie Lefebvre' },
  { id: 'F003', name: 'Luc Petit', email: 'luc@example.com', remainingCredits: 0, lastCreatorContacted: 'Emma Garcia' },
  { id: 'F004', name: 'Marc Roux', email: 'marc@example.com', remainingCredits: 78.25, lastCreatorContacted: 'Laura Martinez' },
  { id: 'F005', name: 'Paul Simon', email: 'paul@example.com', remainingCredits: 200.00, lastCreatorContacted: 'Julie Bernard' },
  { id: 'F006', name: 'Thomas Lambert', email: 'thomas@example.com', remainingCredits: 15.80, lastCreatorContacted: 'Sophie Durand' },
  { id: 'F007', name: 'Nicolas Blanc', email: 'nicolas@example.com', remainingCredits: 90.50, lastCreatorContacted: 'Emma Garcia' },
];

export function AdminFans() {
  const [fans] = useState<Fan[]>(mockFans);
  const { t } = useLanguage();

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{t('fans')}</h1>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('remainingCredits')}</th>
              <th>{t('lastCreatorContacted')}</th>
            </tr>
          </thead>
          <tbody>
            {fans.map((fan) => (
              <tr key={fan.id}>
                <td>{fan.id}</td>
                <td>{fan.name}</td>
                <td>{fan.email}</td>
                <td>€{fan.remainingCredits.toFixed(2)}</td>
                <td>{fan.lastCreatorContacted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
